import * as adminService from "../services/adminService.js";
import * as procurementService from "../services/procurementService.js";
import * as logisticsService from "../services/logisticsService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getAdminDashboard();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (req, res, next) => {
  try {
    const result = await adminService.getAdminSuppliers(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierDetail = async (req, res, next) => {
  try {
    const supplier = await adminService.getAdminSupplierDetail(req.params.id);
    return res.status(200).json({
      success: true,
      ...supplier,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await adminService.getAdminOrders(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const order = await adminService.getAdminOrderDetail(req.params.id);
    return res.status(200).json({
      success: true,
      ...order.toJSON(),
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getProcurement = async (req, res, next) => {
  try {
    const result = await procurementService.getProcurementRequests(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getProcurementDetail = async (req, res, next) => {
  try {
    const request = await procurementService.getProcurementRequest(req.params.id);
    return res.status(200).json({
      success: true,
      ...request.toJSON(),
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierOffers = async (req, res, next) => {
  try {
    const productName = req.query.productName || req.query.product;
    const offers = await procurementService.getSupplierOffersForProduct(productName);
    return res.status(200).json(offers);
  } catch (error) {
    next(error);
  }
};

export const createSupplierOrder = async (req, res, next) => {
  try {
    const order = await procurementService.createSupplierOrder(req.user, req.body);
    return res.status(201).json({
      success: true,
      message: "Supplier order created successfully",
      ...order.toJSON(),
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getLogistics = async (req, res, next) => {
  try {
    const result = await logisticsService.getLogisticsShipments(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getShipmentDetail = async (req, res, next) => {
  try {
    const shipment = await logisticsService.getLogisticsShipment(req.params.id);
    return res.status(200).json({
      success: true,
      ...shipment.toJSON(),
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};
