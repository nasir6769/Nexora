import { ResaleListing } from "../models/ResaleListing.js";
import { ResaleOrder } from "../models/ResaleOrder.js";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { Transaction } from "../models/Transaction.js";
import { Logistics } from "../models/Logistics.js";
import {
  RESALE_LISTING_STATUS,
  RESALE_ORDER_STATUS,
  INVENTORY_MOVEMENT_TYPE,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  LOGISTICS_STATUS,
} from "../utils/constants.js";

export const getResaleListings = async (params = {}) => {
  const query = { status: RESALE_LISTING_STATUS.ACTIVE };

  if (params.search) {
    const searchRegex = new RegExp(params.search, "i");
    query.$or = [
      { productName: searchRegex },
      { sku: searchRegex },
      { category: searchRegex },
      { sellerName: searchRegex },
    ];
  }

  if (params.category && params.category !== "all") {
    query.category = new RegExp(`^${params.category}$`, "i");
  }

  const listings = await ResaleListing.find(query).sort({ createdAt: -1 });

  return {
    data: listings,
    total: listings.length,
  };
};

export const getMyResaleListings = async (merchantId, params = {}) => {
  const query = { merchantId };

  if (params.search) {
    const searchRegex = new RegExp(params.search, "i");
    query.$or = [
      { productName: searchRegex },
      { sku: searchRegex },
      { category: searchRegex },
    ];
  }

  const listings = await ResaleListing.find(query).sort({ createdAt: -1 });

  return {
    data: listings,
    total: listings.length,
  };
};

export const getResaleListing = async (id) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { listingId: id },
      { productId: id },
    ].filter((cond) => cond._id !== null || cond.listingId || cond.productId),
  };

  const listing = await ResaleListing.findOne(query);
  if (!listing) {
    const error = new Error("Resale listing not found");
    error.statusCode = 404;
    throw error;
  }
  return listing;
};

export const createResaleListing = async (merchantUser, data) => {
  const quantity = Number(data.quantity);
  const price = Number(data.price);

  let inventoryItem = null;
  if (data.inventoryId || data.sku) {
    inventoryItem = await Inventory.findOne({
      merchantId: merchantUser._id,
      $or: [
        { _id: data.inventoryId?.match(/^[0-9a-fA-F]{24}$/) ? data.inventoryId : null },
        { sku: data.sku?.toUpperCase() },
      ].filter((cond) => cond._id !== null || cond.sku),
    });
  }

  if (inventoryItem && inventoryItem.stock < quantity) {
    const error = new Error(`Cannot list ${quantity} units. You only have ${inventoryItem.stock} units in inventory.`);
    error.statusCode = 400;
    throw error;
  }

  const listing = await ResaleListing.create({
    merchantId: merchantUser._id,
    sellerName: merchantUser.name || "Merchant",
    inventoryId: inventoryItem?._id || null,
    productName: data.productName,
    sku: data.sku ? data.sku.toUpperCase() : (inventoryItem?.sku || "RESALE-SKU"),
    category: data.category || inventoryItem?.category || "General",
    description: data.description || "",
    price,
    quantity,
    availableQuantity: quantity,
    status: RESALE_LISTING_STATUS.ACTIVE,
  });

  return listing;
};

export const updateResaleListing = async (id, merchantId, data) => {
  const listing = await getResaleListing(id);

  if (listing.merchantId.toString() !== merchantId.toString()) {
    const error = new Error("You can only edit your own resale listings");
    error.statusCode = 403;
    throw error;
  }

  if (data.productName) listing.productName = data.productName;
  if (data.sku) listing.sku = data.sku.toUpperCase();
  if (data.category) listing.category = data.category;
  if (data.description !== undefined) listing.description = data.description;
  if (data.price) listing.price = Number(data.price);
  if (data.quantity) {
    const newQty = Number(data.quantity);
    listing.quantity = newQty;
    listing.availableQuantity = newQty;
  }
  if (data.status) listing.status = data.status;

  await listing.save();
  return listing;
};

export const deleteResaleListing = async (id, merchantId) => {
  const listing = await getResaleListing(id);

  if (listing.merchantId.toString() !== merchantId.toString()) {
    const error = new Error("You can only delete your own resale listings");
    error.statusCode = 403;
    throw error;
  }

  await ResaleListing.deleteOne({ _id: listing._id });
  return { success: true, id };
};

export const createResaleRequestOrOrder = async (buyerUser, data) => {
  const listingId = data.listingId || data.productId;
  const listing = await getResaleListing(listingId);

  // Prevent merchant from buying their own listing
  if (listing.merchantId.toString() === (buyerUser._id || buyerUser.id).toString()) {
    const error = new Error("You cannot purchase your own resale listing");
    error.statusCode = 400;
    throw error;
  }

  if (listing.status !== RESALE_LISTING_STATUS.ACTIVE) {
    const error = new Error("This resale listing is no longer active");
    error.statusCode = 400;
    throw error;
  }

  const requestedQty = Number(data.quantity || 1);
  if (requestedQty <= 0) {
    const error = new Error("Quantity must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  if (requestedQty > (listing.availableQuantity ?? listing.quantity)) {
    const error = new Error(`Only ${listing.availableQuantity} unit(s) available for purchase`);
    error.statusCode = 400;
    throw error;
  }

  const totalAmount = requestedQty * listing.price;

  // Create Resale Order
  const order = await ResaleOrder.create({
    listingId: listing._id,
    buyerId: buyerUser._id || buyerUser.id,
    buyerName: buyerUser.name || "Buyer Merchant",
    sellerId: listing.merchantId,
    sellerName: listing.sellerName,
    productName: listing.productName,
    sku: listing.sku,
    quantity: requestedQty,
    unitPrice: listing.price,
    totalAmount,
    status: RESALE_ORDER_STATUS.PENDING,
    paymentStatus: "paid",
  });

  // Decrement listing available quantity
  listing.availableQuantity = (listing.availableQuantity ?? listing.quantity) - requestedQty;
  if (listing.availableQuantity <= 0) {
    listing.status = RESALE_LISTING_STATUS.SOLD;
  }
  await listing.save();

  // If seller has inventory attached, update seller inventory & record movement
  if (listing.inventoryId) {
    const sellerInv = await Inventory.findById(listing.inventoryId);
    if (sellerInv) {
      const prevStock = sellerInv.stock;
      const newStock = Math.max(0, prevStock - requestedQty);
      sellerInv.stock = newStock;
      sellerInv.quantity = newStock;
      await sellerInv.save();

      await InventoryMovement.create({
        merchantId: listing.merchantId,
        inventoryId: sellerInv._id,
        productName: sellerInv.name,
        sku: sellerInv.sku,
        type: INVENTORY_MOVEMENT_TYPE.RESALE_SOLD,
        quantity: requestedQty,
        previousStock: prevStock,
        newStock: newStock,
        referenceId: order.orderId,
        reason: `M2M Resale Order ${order.orderId}`,
      });
    }
  }

  // Create Simulated Transaction
  await Transaction.create({
    userId: buyerUser._id || buyerUser.id,
    userName: buyerUser.name || "Buyer",
    type: TRANSACTION_TYPE.RESALE_PURCHASE,
    amount: totalAmount,
    referenceId: order.orderId,
    referenceType: "resale",
    paymentMethod: "Simulated Direct Settlement",
    status: TRANSACTION_STATUS.COMPLETED,
  });

  // Create Simulated Logistics
  await Logistics.create({
    orderId: order.orderId,
    orderType: "resale",
    merchantId: buyerUser._id || buyerUser.id,
    merchantName: buyerUser.name || "Buyer Merchant",
    supplierId: listing.merchantId,
    supplierName: listing.sellerName,
    status: LOGISTICS_STATUS.ASSIGNED,
    destination: buyerUser.address?.city || "Buyer Store",
  });

  return order;
};

export const getResaleRequestsOrOrders = async (userId, userRole, params = {}) => {
  const query = {};

  if (userRole === "merchant") {
    query.$or = [{ buyerId: userId }, { sellerId: userId }];
  }

  if (params.status && params.status !== "all") {
    query.status = params.status.toLowerCase();
  }

  const orders = await ResaleOrder.find(query).sort({ createdAt: -1 });

  return {
    data: orders,
    total: orders.length,
  };
};

export const getResaleRequestOrOrder = async (id, userId = null, userRole = null) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { orderId: id },
    ].filter((cond) => cond._id !== null || cond.orderId),
  };

  const order = await ResaleOrder.findOne(query);
  if (!order) {
    const error = new Error("Resale order/request not found");
    error.statusCode = 404;
    throw error;
  }

  if (userRole === "merchant" && userId) {
    const isBuyer = order.buyerId.toString() === userId.toString();
    const isSeller = order.sellerId.toString() === userId.toString();
    if (!isBuyer && !isSeller) {
      const error = new Error("Access denied to this resale order");
      error.statusCode = 403;
      throw error;
    }
  }

  return order;
};

export const cancelResaleRequestOrOrder = async (id, userId) => {
  const order = await getResaleRequestOrOrder(id, userId, "merchant");

  if ([RESALE_ORDER_STATUS.COMPLETED, RESALE_ORDER_STATUS.IN_TRANSIT].includes(order.status)) {
    const error = new Error(`Cannot cancel an order that is already ${order.status}`);
    error.statusCode = 400;
    throw error;
  }

  order.status = RESALE_ORDER_STATUS.CANCELLED;
  await order.save();

  // Restore listing available quantity
  const listing = await ResaleListing.findById(order.listingId);
  if (listing) {
    listing.availableQuantity = (listing.availableQuantity || 0) + order.quantity;
    if (listing.status === RESALE_LISTING_STATUS.SOLD) {
      listing.status = RESALE_LISTING_STATUS.ACTIVE;
    }
    await listing.save();
  }

  return {
    success: true,
    id: order.orderId || order._id.toString(),
    status: RESALE_ORDER_STATUS.CANCELLED,
  };
};
