import * as supplierService from "../services/supplierService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ROLES } from "../utils/constants.js";

export const getSupplierProducts = async (req, res, next) => {
  try {
    const supplierId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const result = await supplierService.getSupplierProducts(supplierId, req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierProduct = async (req, res, next) => {
  try {
    const supplierId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const product = await supplierService.getSupplierProduct(req.params.id, supplierId);
    return res.status(200).json({
      success: true,
      ...product.toJSON(),
      data: product,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const createSupplierProduct = async (req, res, next) => {
  try {
    const product = await supplierService.createSupplierProduct(req.user, req.body);
    return res.status(201).json({
      success: true,
      message: "Supplier product created successfully",
      ...product.toJSON(),
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupplierProduct = async (req, res, next) => {
  try {
    const supplierId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const product = await supplierService.updateSupplierProduct(req.params.id, supplierId, req.body);
    return res.status(200).json({
      success: true,
      message: "Supplier product updated successfully",
      ...product.toJSON(),
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplierProduct = async (req, res, next) => {
  try {
    const supplierId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const result = await supplierService.deleteSupplierProduct(req.params.id, supplierId);
    return sendSuccess(res, 200, "Supplier product deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getSupplierOrders = async (req, res, next) => {
  try {
    const supplierId = req.user._id || req.user.id;
    const result = await supplierService.getSupplierOrders(supplierId, req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierOrder = async (req, res, next) => {
  try {
    const supplierId = req.user._id || req.user.id;
    const order = await supplierService.getSupplierOrder(req.params.id, supplierId);
    return res.status(200).json({
      success: true,
      ...order.toJSON(),
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupplierOrderStatus = async (req, res, next) => {
  try {
    const supplierId = req.user._id || req.user.id;
    const { status } = req.body;
    const order = await supplierService.updateSupplierOrderStatus(req.params.id, supplierId, status);
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      ...order.toJSON(),
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
