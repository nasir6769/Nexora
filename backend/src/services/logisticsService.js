import { Logistics } from "../models/Logistics.js";
import { LOGISTICS_STATUS } from "../utils/constants.js";

export const createShipment = async (data) => {
  const shipment = await Logistics.create({
    orderId: data.orderId,
    orderType: data.orderType || "procurement",
    merchantId: data.merchantId,
    merchantName: data.merchantName || "Merchant",
    supplierId: data.supplierId,
    supplierName: data.supplierName || "Supplier",
    carrier: data.carrier || "Express Freight Network",
    currentLocation: data.currentLocation || "Origin Fulfillment Hub",
    destination: data.destination || "Merchant Warehouse",
    status: data.status || LOGISTICS_STATUS.ASSIGNED,
    estimatedDelivery: data.estimatedDelivery,
  });

  return shipment;
};

export const getLogisticsShipments = async (params = {}) => {
  const query = {};

  if (params.status && params.status !== "all") {
    query.status = params.status.toLowerCase();
  }

  if (params.search) {
    const searchRegex = new RegExp(params.search, "i");
    query.$or = [
      { shipmentId: searchRegex },
      { orderId: searchRegex },
      { trackingNumber: searchRegex },
      { merchantName: searchRegex },
      { supplierName: searchRegex },
    ];
  }

  const shipments = await Logistics.find(query).sort({ createdAt: -1 });

  return {
    data: shipments,
    total: shipments.length,
  };
};

export const getLogisticsShipment = async (id) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { shipmentId: id },
      { orderId: id },
      { trackingNumber: id },
    ].filter((cond) => cond._id !== null || cond.shipmentId || cond.orderId || cond.trackingNumber),
  };

  const shipment = await Logistics.findOne(query);
  if (!shipment) {
    const error = new Error("Logistics shipment record not found");
    error.statusCode = 404;
    throw error;
  }
  return shipment;
};

export const updateLogisticsStatus = async (id, status, location = "", note = "") => {
  const shipment = await getLogisticsShipment(id);

  shipment.status = status.toLowerCase();
  if (location) {
    shipment.currentLocation = location;
  }

  shipment.updates.push({
    timestamp: new Date(),
    status: shipment.status,
    location: location || shipment.currentLocation,
    note: note || `Status updated to ${shipment.status}`,
  });

  await shipment.save();
  return shipment;
};
