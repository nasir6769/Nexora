import { SupplierProduct } from "../models/SupplierProduct.js";
import { ProcurementOrder } from "../models/ProcurementOrder.js";
import { Logistics } from "../models/Logistics.js";
import { PROCUREMENT_STATUS, LOGISTICS_STATUS } from "../utils/constants.js";

export const getSupplierProducts = async (supplierId, params = {}) => {
  const query = { supplierId };

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

  const products = await SupplierProduct.find(query).sort({ createdAt: -1 });

  return {
    data: products,
    total: products.length,
  };
};

export const getSupplierProduct = async (id, supplierId = null) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { productId: id },
    ].filter((cond) => cond._id !== null || cond.productId),
  };

  if (supplierId) {
    query.supplierId = supplierId;
  }

  const product = await SupplierProduct.findOne(query);
  if (!product) {
    const error = new Error("Supplier product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const createSupplierProduct = async (supplierUser, data) => {
  const stock = Number(data.stock ?? data.availableStock ?? 0);
  const moq = Number(data.minimumOrderQuantity || 1);

  const product = await SupplierProduct.create({
    supplierId: supplierUser._id,
    supplierName: supplierUser.name || "Supplier",
    name: data.name || data.productName,
    productName: data.productName || data.name,
    sku: data.sku.toUpperCase(),
    category: data.category,
    description: data.description || "",
    price: Number(data.price),
    stock,
    availableStock: stock,
    minimumOrderQuantity: moq,
    estimatedDeliveryDays: Number(data.estimatedDeliveryDays || 2),
    status: data.status || "active",
  });

  return product;
};

export const updateSupplierProduct = async (id, supplierId, data) => {
  const product = await getSupplierProduct(id, supplierId);

  if (data.name) product.name = data.name;
  if (data.productName) product.productName = data.productName;
  if (data.sku) product.sku = data.sku.toUpperCase();
  if (data.category) product.category = data.category;
  if (data.description !== undefined) product.description = data.description;
  if (data.price !== undefined) product.price = Number(data.price);
  if (data.stock !== undefined || data.availableStock !== undefined) {
    const newStock = Number(data.stock ?? data.availableStock);
    product.stock = newStock;
    product.availableStock = newStock;
  }
  if (data.minimumOrderQuantity !== undefined) {
    product.minimumOrderQuantity = Number(data.minimumOrderQuantity);
  }
  if (data.estimatedDeliveryDays !== undefined) {
    product.estimatedDeliveryDays = Number(data.estimatedDeliveryDays);
  }
  if (data.status) product.status = data.status;

  await product.save();
  return product;
};

export const deleteSupplierProduct = async (id, supplierId) => {
  const product = await getSupplierProduct(id, supplierId);
  await SupplierProduct.deleteOne({ _id: product._id });
  return { success: true, id };
};

export const getSupplierOrders = async (supplierId, params = {}) => {
  // Base query: only orders assigned to this specific supplier
  const query = { supplierId };

  if (params.status && params.status !== "all") {
    query.status = params.status.toLowerCase();
  }

  if (params.search) {
    const searchRegex = new RegExp(params.search, "i");
    query.$and = [
      { supplierId },
      {
        $or: [
          { requestId: searchRegex },
          { merchantName: searchRegex },
          { productName: searchRegex },
        ],
      },
    ];
    delete query.supplierId;
  }

  const orders = await ProcurementOrder.find(query).sort({ createdAt: -1 });

  return {
    data: orders,
    total: orders.length,
  };
};

export const getSupplierOrder = async (id, supplierId = null) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { requestId: id },
    ].filter((cond) => cond._id !== null || cond.requestId),
  };

  if (supplierId) {
    query.$or = [{ supplierId }, { _id: query.$or[0]?._id }];
  }

  const order = await ProcurementOrder.findOne(query);
  if (!order) {
    const error = new Error("Supplier order not found");
    error.statusCode = 404;
    throw error;
  }
  return order;
};

export const updateSupplierOrderStatus = async (id, supplierId, status) => {
  // Find the order — allow finding by ID or requestId
  const order = await getSupplierOrder(id);

  // Ensure the order actually belongs to this supplier (supplierId must match if set)
  const orderSupplierId = order.supplierId?.toString();
  const callerSupplierId = supplierId?.toString();
  if (orderSupplierId && callerSupplierId && orderSupplierId !== callerSupplierId) {
    const error = new Error("You are not authorized to update this order");
    error.statusCode = 403;
    throw error;
  }

  const rawStatus = (status || "").toLowerCase().trim();
  const normalizedStatus =
    rawStatus === "accepted"
      ? PROCUREMENT_STATUS.SUPPLIER_ACCEPTED
      : rawStatus === "rejected"
      ? PROCUREMENT_STATUS.SUPPLIER_REJECTED
      : rawStatus;

  const currentStatus = (order.status || "").toLowerCase();

  // State Machine Guard: Rejection / Cancellation is terminal
  if (
    [PROCUREMENT_STATUS.SUPPLIER_REJECTED, PROCUREMENT_STATUS.REJECTED, PROCUREMENT_STATUS.CANCELLED].includes(currentStatus)
  ) {
    const error = new Error(`Cannot update an order that is already ${currentStatus}`);
    error.statusCode = 400;
    throw error;
  }

  // Idempotency check for ACCEPT
  const isAcceptAction =
    normalizedStatus === PROCUREMENT_STATUS.SUPPLIER_ACCEPTED ||
    normalizedStatus === PROCUREMENT_STATUS.ACCEPTED;

  const isAlreadyAccepted = [
    PROCUREMENT_STATUS.SUPPLIER_ACCEPTED,
    PROCUREMENT_STATUS.ACCEPTED,
    PROCUREMENT_STATUS.PREPARING,
    PROCUREMENT_STATUS.LOGISTICS_ASSIGNED,
    PROCUREMENT_STATUS.IN_TRANSIT,
    PROCUREMENT_STATUS.DELIVERED,
    PROCUREMENT_STATUS.COMPLETED,
  ].includes(currentStatus);

  if (isAcceptAction && isAlreadyAccepted) {
    const error = new Error("This order has already been accepted.");
    error.statusCode = 400;
    throw error;
  }

  // Stock deduction occurs ONLY when transitioning from non-accepted state to ACCEPTED/PREPARING
  if (isAcceptAction && !isAlreadyAccepted) {
    const effectiveSupplierId = order.supplierId || supplierId;
    const requiredQuantity = Number(order.quantity || 1);

    // Search for supplier product matching this order
    const searchConditions = [];
    if (order.productId) searchConditions.push({ productId: order.productId });
    if (order.sku) searchConditions.push({ sku: order.sku.toUpperCase() });
    if (order.productName) {
      searchConditions.push(
        { name: new RegExp(`^${order.productName}$`, "i") },
        { productName: new RegExp(`^${order.productName}$`, "i") }
      );
    }

    const productQuery = { supplierId: effectiveSupplierId };
    if (searchConditions.length > 0) {
      productQuery.$or = searchConditions;
    }

    let product = await SupplierProduct.findOne(productQuery);

    // Fallback: search by supplierId only if productQuery didn't find specific product
    if (!product) {
      product = await SupplierProduct.findOne({ supplierId: effectiveSupplierId });
    }

    if (product) {
      const currentAvailable = Number(product.availableStock ?? product.stock ?? 0);
      if (currentAvailable < requiredQuantity) {
        const error = new Error("Insufficient supplier stock to accept this order.");
        error.statusCode = 400;
        throw error;
      }

      // Atomic update to ensure stock never drops below 0 and prevent race conditions
      const updatedProduct = await SupplierProduct.findOneAndUpdate(
        {
          _id: product._id,
          availableStock: { $gte: requiredQuantity },
        },
        {
          $inc: { availableStock: -requiredQuantity, stock: -requiredQuantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        const error = new Error("Insufficient supplier stock to accept this order.");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // Bind supplierId if missing
  if (!order.supplierId && supplierId) {
    order.supplierId = supplierId;
  }

  order.status = normalizedStatus;
  await order.save();

  // Update or create linked logistics entry
  if (normalizedStatus !== PROCUREMENT_STATUS.SUPPLIER_REJECTED) {
    let logistics = await Logistics.findOne({ orderId: order.requestId });
    if (!logistics) {
      await Logistics.create({
        orderId: order.requestId,
        orderType: "procurement",
        merchantId: order.merchantId,
        merchantName: order.merchantName,
        supplierId: order.supplierId || supplierId,
        supplierName: order.supplierName || "Supplier",
        status:
          normalizedStatus === PROCUREMENT_STATUS.SUPPLIER_ACCEPTED || normalizedStatus === PROCUREMENT_STATUS.ACCEPTED
            ? LOGISTICS_STATUS.ASSIGNED
            : normalizedStatus === PROCUREMENT_STATUS.PREPARING
            ? LOGISTICS_STATUS.PREPARING
            : LOGISTICS_STATUS.IN_TRANSIT,
      });
    } else {
      if (normalizedStatus === PROCUREMENT_STATUS.PREPARING) {
        logistics.status = LOGISTICS_STATUS.PREPARING;
      } else if (normalizedStatus === PROCUREMENT_STATUS.COMPLETED || normalizedStatus === PROCUREMENT_STATUS.DELIVERED) {
        logistics.status = LOGISTICS_STATUS.DELIVERED;
      }
      await logistics.save();
    }
  }

  return order;
};
