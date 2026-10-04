import mongoose from "mongoose";
import { RESALE_ORDER_STATUS } from "../utils/constants.js";

const resaleOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return `RR-${Math.floor(2000 + Math.random() * 8000)}`;
      },
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResaleListing",
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    buyerName: {
      type: String,
      trim: true,
      default: "Buyer Merchant",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerName: {
      type: String,
      trim: true,
      default: "Seller Merchant",
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
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(RESALE_ORDER_STATUS),
      default: RESALE_ORDER_STATUS.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid",
    },
    paymentId: {
      type: String,
      trim: true,
      default: "",
    },
    trackingNumber: {
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
        ret.id = ret.orderId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ResaleOrder = mongoose.model("ResaleOrder", resaleOrderSchema);
