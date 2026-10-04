import * as resaleService from "../services/resaleService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ROLES } from "../utils/constants.js";

export const getResaleListings = async (req, res, next) => {
  try {
    const result = await resaleService.getResaleListings(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyResaleListings = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const result = await resaleService.getMyResaleListings(merchantId, req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getResaleListing = async (req, res, next) => {
  try {
    const listing = await resaleService.getResaleListing(req.params.id);
    return res.status(200).json({
      success: true,
      ...listing.toJSON(),
      data: listing,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

export const createResaleListing = async (req, res, next) => {
  try {
    const listing = await resaleService.createResaleListing(req.user, req.body);
    return res.status(201).json({
      success: true,
      message: "Resale listing published successfully",
      ...listing.toJSON(),
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResaleListing = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const listing = await resaleService.updateResaleListing(req.params.id, merchantId, req.body);
    return res.status(200).json({
      success: true,
      message: "Resale listing updated successfully",
      ...listing.toJSON(),
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResaleListing = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const result = await resaleService.deleteResaleListing(req.params.id, merchantId);
    return sendSuccess(res, 200, "Resale listing removed", result);
  } catch (error) {
    next(error);
  }
};

export const createResaleRequestOrOrder = async (req, res, next) => {
  try {
    const order = await resaleService.createResaleRequestOrOrder(req.user, req.body);
    return res.status(201).json({
      success: true,
      message: "Resale order placed successfully",
      ...order.toJSON(),
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getResaleRequestsOrOrders = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;
    const result = await resaleService.getResaleRequestsOrOrders(userId, role, req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const getResaleRequestOrOrder = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;
    const order = await resaleService.getResaleRequestOrOrder(req.params.id, userId, role);
    return res.status(200).json({
      success: true,
      ...order.toJSON(),
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelResaleRequestOrOrder = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await resaleService.cancelResaleRequestOrOrder(req.params.id, userId);
    return sendSuccess(res, 200, "Resale request cancelled successfully", result);
  } catch (error) {
    next(error);
  }
};
