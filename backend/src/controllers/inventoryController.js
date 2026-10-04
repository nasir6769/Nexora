import * as inventoryService from "../services/inventoryService.js";
import * as analyticsService from "../services/analyticsService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ROLES } from "../utils/constants.js";

export const getInventory = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const result = await inventoryService.getInventory(merchantId, req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryItem = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const item = await inventoryService.getInventoryItem(req.params.id, merchantId);
    return res.status(200).json({
      success: true,
      ...item.toJSON(),
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const item = await inventoryService.createInventoryItem(merchantId, req.body);
    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      ...item.toJSON(),
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const item = await inventoryService.updateInventoryItem(req.params.id, merchantId, req.body);
    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      ...item.toJSON(),
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const result = await inventoryService.deleteInventoryItem(req.params.id, merchantId);
    return sendSuccess(res, 200, "Inventory item deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const delta = Number(req.body.quantity);
    const reason = req.body.reason || "Manual quantity adjustment";
    const item = await inventoryService.adjustStockQuantity(req.params.id, merchantId, delta, reason);
    return sendSuccess(res, 200, "Inventory quantity adjusted successfully", item);
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlerts = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const items = await inventoryService.getLowStockAlerts(merchantId);
    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getSlowMovingAlerts = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const items = await inventoryService.getSlowMovingAlerts(merchantId);
    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getInventoryAnalytics = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const stats = await analyticsService.getInventoryAnalytics(merchantId);
    return sendSuccess(res, 200, "Inventory analytics retrieved", stats);
  } catch (error) {
    next(error);
  }
};

export const getExpiryRiskItems = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const items = await analyticsService.getExpiryRiskItems(merchantId);
    return sendSuccess(res, 200, "Expiry risk items retrieved", items);
  } catch (error) {
    next(error);
  }
};
