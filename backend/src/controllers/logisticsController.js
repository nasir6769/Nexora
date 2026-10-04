import * as logisticsService from "../services/logisticsService.js";
import { sendSuccess } from "../utils/apiResponse.js";

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

export const getLogisticsDetail = async (req, res, next) => {
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

export const createShipment = async (req, res, next) => {
  try {
    const shipment = await logisticsService.createShipment(req.body);
    return sendSuccess(res, 201, "Logistics shipment created", shipment);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status, location, note } = req.body;
    const shipment = await logisticsService.updateLogisticsStatus(req.params.id, status, location, note);
    return res.status(200).json({
      success: true,
      message: "Logistics status updated",
      ...shipment.toJSON(),
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};
