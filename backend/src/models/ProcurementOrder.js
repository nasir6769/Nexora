import mongoose from "mongoose";
import { PROCUREMENT_STATUS } from "../utils/constants.js";

const deliveryAddressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, trim: true, default: "" },
    addressLine2: { type: String, trim: true, default: "" },
    landmark: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const procurementOrderSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return `PR-${Math.floor(1000 + Math.random() * 9000)}`;
      },
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      default: "",
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commitmentPercentage: {
      type: Number,
      default: 10,
    },
    commitmentAmount: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
      trim: true,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid",
    },
    status: {
      type: String,
      enum: Object.values(PROCUREMENT_STATUS),
      default: PROCUREMENT_STATUS.PENDING,
      index: true,
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      default: () => ({}),
    },
    consolidatedOrderId: {
      type: String,
      trim: true,
      default: "",
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.requestId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ProcurementOrder = mongoose.model("ProcurementOrder", procurementOrderSchema);
