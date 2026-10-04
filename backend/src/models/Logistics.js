import mongoose from "mongoose";
import { LOGISTICS_STATUS } from "../utils/constants.js";

const shipmentUpdateSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const logisticsSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return `SHIP-${Math.floor(6000 + Math.random() * 4000)}`;
      },
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: ["procurement", "resale"],
      default: "procurement",
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    merchantName: {
      type: String,
      trim: true,
      default: "Merchant",
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    supplierName: {
      type: String,
      trim: true,
      default: "Supplier",
    },
    carrier: {
      type: String,
      trim: true,
      default: "Express Freight Network",
    },
    trackingNumber: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return `MN-TRK-${Math.floor(10000 + Math.random() * 90000)}`;
      },
    },
    currentLocation: {
      type: String,
      trim: true,
      default: "Origin Fulfillment Center",
    },
    destination: {
      type: String,
      trim: true,
      default: "",
    },
    estimatedDelivery: {
      type: String,
      trim: true,
      default: function () {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split("T")[0];
      },
    },
    status: {
      type: String,
      enum: Object.values(LOGISTICS_STATUS),
      default: LOGISTICS_STATUS.ASSIGNED,
      index: true,
    },
    updates: [shipmentUpdateSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.shipmentId || ret._id.toString();
        ret.trackingId = ret.trackingNumber;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Logistics = mongoose.model("Logistics", logisticsSchema);
