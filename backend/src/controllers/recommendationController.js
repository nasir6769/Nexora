import * as analyticsService from "../services/analyticsService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getProcurementRecommendations = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const recommendations = await analyticsService.getProcurementRecommendations(merchantId);
    return sendSuccess(res, 200, "Procurement recommendations generated", recommendations);
  } catch (error) {
    next(error);
  }
};

export const getResaleRecommendations = async (req, res, next) => {
  try {
    const merchantId = req.user._id || req.user.id;
    const recommendations = await analyticsService.getResaleRecommendations(merchantId);
    return sendSuccess(res, 200, "Resale recommendations generated", recommendations);
  } catch (error) {
    next(error);
  }
};
