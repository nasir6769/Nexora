import { ProcurementOrder } from "../models/ProcurementOrder.js";
import { SupplierProduct } from "../models/SupplierProduct.js";
import { SupplierOffer } from "../models/SupplierOffer.js";
import { Logistics } from "../models/Logistics.js";
import { PROCUREMENT_STATUS, LOGISTICS_STATUS } from "../utils/constants.js";
import { selectBestSupplier } from "./supplierSelectionService.js";

export const getProcurementProducts = async (params = {}) => {
  const query = { status: "active" };

  if (params.search) {
    const searchRegex = new RegExp(params.search, "i");
    query.$or = [
      { name: searchRegex },
      { productName: searchRegex },
      { sku: searchRegex },
      { category: searchRegex },
    ];
  }

  if (params.category && params.category !== "all") {
    query.category = new RegExp(`^${params.category}$`, "i");
  }

  const products = await SupplierProduct.find(query).sort({ rating: -1, createdAt: -1 });

  return {
    data: products,
    total: products.length,
  };
};

export const getProcurementProduct = async (id) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { productId: id },
    ].filter((cond) => cond._id !== null || cond.productId),
  };

  const product = await SupplierProduct.findOne(query);
  if (!product) {
    const error = new Error("Procurement product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const createProcurementRequest = async (merchantUser, data) => {
  let product = null;
  try {
    product = await getProcurementProduct(data.productId);
  } catch {
    // Product may be by ID or custom
  }

  const productName = data.productName || product?.name || product?.productName || "Product";
  const sku = data.sku || product?.sku || "SKU-GEN";
  const category = data.category || product?.category || "General";
  const unitPrice = Number(data.unitPrice || product?.price || 0);
  const quantity = Number(data.quantity || 1);
  const totalAmount = Number(data.totalAmount || (quantity * unitPrice));
  const commitmentPercentage = Number(data.commitmentPercentage || 10);
  const commitmentAmount = Number(data.commitmentAmount || ((totalAmount * commitmentPercentage) / 100));

  const order = await ProcurementOrder.create({
    merchantId: merchantUser._id || merchantUser.id,
    merchantName: merchantUser.name || "Merchant",
    productId: data.productId,
    productName,
    sku,
    category,
    quantity,
    unitPrice,
    totalAmount,
    commitmentPercentage,
    commitmentAmount,
    paymentId: data.paymentId || "",
    paymentStatus: data.paymentStatus || "paid",
    status: PROCUREMENT_STATUS.PENDING,
    deliveryAddress: data.deliveryAddress || merchantUser.address || {},
  });

  return order;
};

export const getProcurementRequests = async (filter = {}) => {
  const query = {};

  if (filter.merchantId) {
    query.merchantId = filter.merchantId;
  }

  if (filter.status && filter.status !== "all") {
    query.status = filter.status.toLowerCase();
  }

  if (filter.search) {
    const searchRegex = new RegExp(filter.search, "i");
    query.$or = [
      { requestId: searchRegex },
      { productName: searchRegex },
      { merchantName: searchRegex },
      { supplierName: searchRegex },
    ];
  }

  const requests = await ProcurementOrder.find(query).sort({ createdAt: -1 });
  return {
    data: requests,
    total: requests.length,
  };
};

export const getProcurementRequest = async (id, merchantId = null) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { requestId: id },
    ].filter((cond) => cond._id !== null || cond.requestId),
  };

  if (merchantId) {
    query.merchantId = merchantId;
  }

  const request = await ProcurementOrder.findOne(query);
  if (!request) {
    const error = new Error("Procurement request not found");
    error.statusCode = 404;
    throw error;
  }
  return request;
};

export const cancelProcurementRequest = async (id, merchantId = null) => {
  const request = await getProcurementRequest(id, merchantId);

  if ([PROCUREMENT_STATUS.COMPLETED, PROCUREMENT_STATUS.DELIVERED, PROCUREMENT_STATUS.IN_TRANSIT].includes(request.status)) {
    const error = new Error(`Cannot cancel a procurement request that is already ${request.status}`);
    error.statusCode = 400;
    throw error;
  }

  request.status = PROCUREMENT_STATUS.CANCELLED;
  await request.save();

  return {
    success: true,
    id: request.requestId || request._id.toString(),
    status: PROCUREMENT_STATUS.CANCELLED,
  };
};

export const getSupplierOffersForProduct = async (productName) => {
  if (!productName) return [];
  const nameRegex = new RegExp(productName, "i");

  const offers = await SupplierOffer.find({ productName: nameRegex, isActive: true });
  if (offers.length > 0) {
    return offers;
  }

  // Fallback to active products from suppliers
  const products = await SupplierProduct.find({
    $or: [{ name: nameRegex }, { productName: nameRegex }],
    status: "active",
  });

  return products.map((prod) => ({
    id: prod._id.toString(),
    supplierId: prod.supplierId.toString(),
    supplierName: prod.supplierName || "Verified Supplier",
    productName: prod.name || prod.productName,
    price: prod.price,
    availableStock: prod.availableStock ?? prod.stock,
    minimumOrderQuantity: prod.minimumOrderQuantity || 1,
    deliveryDays: prod.estimatedDeliveryDays || 2,
    rating: prod.rating || 4.8,
  }));
};

export const createSupplierOrder = async (adminUser, data) => {
  let request = null;
  if (data.requestId) {
    request = await getProcurementRequest(data.requestId);
  }

  const orderQuantity = Number(data.quantity || request?.quantity || 1);
  const unitPrice = Number(data.unitPrice || request?.unitPrice || 0);
  const totalAmount = Number(data.totalAmount || (orderQuantity * unitPrice));

  if (request) {
    // Resolve supplierId: if the provided ID is a SupplierProduct ID, map to the actual supplier user ID
    let resolvedSupplierId = data.supplierId;
    let resolvedSupplierName = data.supplierName || "Supplier";
    try {
      const mongoose = (await import("mongoose")).default;
      if (mongoose.isValidObjectId(data.supplierId)) {
        const productMatch = await SupplierProduct.findById(data.supplierId);
        if (productMatch) {
          resolvedSupplierId = productMatch.supplierId;
          resolvedSupplierName = data.supplierName || productMatch.supplierName || "Supplier";
        }
      }
    } catch {
      // Keep original supplierId if lookup fails
    }

    request.supplierId = resolvedSupplierId;
    request.supplierName = resolvedSupplierName;
    request.quantity = orderQuantity;
    request.unitPrice = unitPrice;
    request.totalAmount = totalAmount;
    request.status = PROCUREMENT_STATUS.ACCEPTED;
    await request.save();

    // Auto-create initial simulated logistics tracking
    const existingLogistics = await Logistics.findOne({ orderId: request.requestId });
    if (!existingLogistics) {
      await Logistics.create({
        orderId: request.requestId,
        orderType: "procurement",
        merchantId: request.merchantId,
        merchantName: request.merchantName,
        supplierId: resolvedSupplierId,
        supplierName: resolvedSupplierName,
        status: LOGISTICS_STATUS.ASSIGNED,
        destination: request.deliveryAddress?.city || "Destination Merchant Hub",
      });
    }

    return request;
  }

  const newOrder = await ProcurementOrder.create({
    merchantId: adminUser._id,
    merchantName: "Platform Order",
    supplierId: data.supplierId,
    supplierName: data.supplierName,
    productId: data.productId || "prod-generic",
    productName: data.productName,
    quantity: orderQuantity,
    unitPrice,
    totalAmount,
    status: PROCUREMENT_STATUS.ACCEPTED,
  });

  return newOrder;
};
