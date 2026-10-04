import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { INVENTORY_MOVEMENT_TYPE, INVENTORY_STATUS } from "../utils/constants.js";

export const getInventory = async (merchantId, params = {}) => {
  const query = {};
  if (merchantId) {
    query.merchantId = merchantId;
  }

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

  if (params.status && params.status !== "all") {
    query.status = params.status;
  }

  const items = await Inventory.find(query).sort({ updatedAt: -1 });
  return {
    data: items,
    total: items.length,
  };
};

export const getInventoryItem = async (id, merchantId = null) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { productId: id },
    ].filter((cond) => cond._id !== null || cond.productId),
  };

  if (merchantId) {
    query.merchantId = merchantId;
  }

  const item = await Inventory.findOne(query);
  if (!item) {
    const error = new Error("Inventory item not found");
    error.statusCode = 404;
    throw error;
  }
  return item;
};

export const createInventoryItem = async (merchantId, data) => {
  const existingItem = await Inventory.findOne({
    merchantId,
    sku: data.sku.toUpperCase(),
  });

  if (existingItem) {
    const error = new Error(`An inventory item with SKU '${data.sku}' already exists in your inventory`);
    error.statusCode = 409;
    throw error;
  }

  const stock = Number(data.stock ?? data.quantity ?? 0);
  const lowStockThreshold = Number(data.lowStockThreshold ?? 10);

  const item = await Inventory.create({
    merchantId,
    name: data.name || data.productName,
    productName: data.productName || data.name,
    sku: data.sku.toUpperCase(),
    category: data.category,
    description: data.description || "",
    price: Number(data.price),
    stock,
    quantity: stock,
    lowStockThreshold,
    expiryDate: data.expiryDate || null,
  });

  if (stock > 0) {
    await InventoryMovement.create({
      merchantId,
      inventoryId: item._id,
      productName: item.name,
      sku: item.sku,
      type: INVENTORY_MOVEMENT_TYPE.INBOUND,
      quantity: stock,
      previousStock: 0,
      newStock: stock,
      reason: "Initial inventory setup",
    });
  }

  return item;
};

export const updateInventoryItem = async (id, merchantId, data) => {
  const item = await getInventoryItem(id, merchantId);

  const prevStock = item.stock;

  if (data.name) item.name = data.name;
  if (data.productName) item.productName = data.productName;
  if (data.sku) item.sku = data.sku.toUpperCase();
  if (data.category) item.category = data.category;
  if (data.description !== undefined) item.description = data.description;
  if (data.price !== undefined) item.price = Number(data.price);
  if (data.lowStockThreshold !== undefined) item.lowStockThreshold = Number(data.lowStockThreshold);
  if (data.status) item.status = data.status;

  if (data.stock !== undefined || data.quantity !== undefined) {
    const newStock = Number(data.stock ?? data.quantity);
    if (newStock < 0) {
      const error = new Error("Inventory stock cannot be negative");
      error.statusCode = 400;
      throw error;
    }

    if (newStock !== prevStock) {
      item.stock = newStock;
      item.quantity = newStock;

      await InventoryMovement.create({
        merchantId,
        inventoryId: item._id,
        productName: item.name,
        sku: item.sku,
        type: INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
        quantity: Math.abs(newStock - prevStock),
        previousStock: prevStock,
        newStock: newStock,
        reason: data.reason || "Manual stock update",
      });
    }
  }

  await item.save();
  return item;
};

export const deleteInventoryItem = async (id, merchantId) => {
  const item = await getInventoryItem(id, merchantId);
  await Inventory.deleteOne({ _id: item._id });
  return { success: true, id: id };
};

export const adjustStockQuantity = async (id, merchantId, delta, reason = "Quantity adjustment") => {
  const item = await getInventoryItem(id, merchantId);
  const previousStock = item.stock;
  const newStock = previousStock + delta;

  if (newStock < 0) {
    const error = new Error(`Cannot reduce stock by ${Math.abs(delta)}. Current stock is ${previousStock}`);
    error.statusCode = 400;
    throw error;
  }

  item.stock = newStock;
  item.quantity = newStock;
  await item.save();

  await InventoryMovement.create({
    merchantId,
    inventoryId: item._id,
    productName: item.name,
    sku: item.sku,
    type: delta > 0 ? INVENTORY_MOVEMENT_TYPE.INBOUND : INVENTORY_MOVEMENT_TYPE.OUTBOUND,
    quantity: Math.abs(delta),
    previousStock,
    newStock,
    reason,
  });

  return item;
};

export const getLowStockAlerts = async (merchantId) => {
  const items = await Inventory.find({ merchantId });
  return items.filter((item) => item.stock <= item.lowStockThreshold);
};

export const getSlowMovingAlerts = async (merchantId) => {
  const items = await Inventory.find({
    merchantId,
    $or: [
      { status: INVENTORY_STATUS.SLOW_MOVING },
      { status: INVENTORY_STATUS.EXCESS },
      { status: INVENTORY_STATUS.DEAD_STOCK },
      { stock: { $gt: 20 }, salesVelocity: { $lte: 2 } },
    ],
  });
  return items;
};
