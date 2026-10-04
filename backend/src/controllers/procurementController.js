import * as procurementService from "../services/procurementService.js";
import * as demandAggregationService from "../services/demandAggregationService.js";
import * as supplierSelectionService from "../services/supplierSelectionService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ROLES } from "../utils/constants.js";

export const getProcurementProducts = async (req, res, next) => {
  try {
    const result = await procurementService.getProcurementProducts(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getProcurementProduct = async (req, res, next) => {
  try {
    const product = await procurementService.getProcurementProduct(req.params.id);
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

export const createProcurementRequest = async (req, res, next) => {
  try {
    const order = await procurementService.createProcurementRequest(req.user, req.body);
    return res.status(201).json({
      success: true,
      message: "Procurement request submitted successfully",
      ...order.toJSON(),
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getProcurementRequests = async (req, res, next) => {
  try {
    const filter = { ...req.query };
    if (req.user.role === ROLES.MERCHANT) {
      filter.merchantId = req.user._id || req.user.id;
    }

    const result = await procurementService.getProcurementRequests(filter);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getProcurementRequest = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const request = await procurementService.getProcurementRequest(req.params.id, merchantId);
    return res.status(200).json({
      success: true,
      ...request.toJSON(),
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelProcurementRequest = async (req, res, next) => {
  try {
    const merchantId = req.user.role === ROLES.ADMIN ? null : (req.user._id || req.user.id);
    const result = await procurementService.cancelProcurementRequest(req.params.id, merchantId);
    return sendSuccess(res, 200, "Procurement request cancelled successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getAggregatedDemand = async (req, res, next) => {
  try {
    const aggregated = await demandAggregationService.aggregateDemand(req.query);
    return sendSuccess(res, 200, "Demand aggregation calculated", aggregated);
  } catch (error) {
    next(error);
  }
};

export const getProcurementSuppliersOrOffers = async (req, res, next) => {
  try {
    const productName = req.query.productName || req.query.product;
    const offers = await procurementService.getSupplierOffersForProduct(productName);
    return res.status(200).json(offers);
  } catch (error) {
    next(error);
  }
};

export const selectSupplier = async (req, res, next) => {
  try {
    const { productName, quantity, requestId, supplierId } = req.body;

    if (supplierId && requestId) {
      // Direct selection
      const result = await procurementService.createSupplierOrder(req.user, req.body);
      return sendSuccess(res, 200, "Supplier selected and order initiated", result);
    }

    // Deterministic selection recommendation
    const selection = await supplierSelectionService.selectBestSupplier(productName, Number(quantity || 1));
    return sendSuccess(res, 200, "Optimal supplier recommendation calculated", selection);
  } catch (error) {
    next(error);
  }
};
