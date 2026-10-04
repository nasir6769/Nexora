import mongoose from "mongoose";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../utils/constants.js";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      trim: true,
      default: "User",
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    percentage: {
      type: Number,
      default: 10,
    },
    referenceId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    referenceType: {
      type: String,
      enum: ["procurement", "resale", "other"],
      default: "procurement",
    },
    paymentMethod: {
      type: String,
      default: "Simulated Payment Gateway",
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.COMPLETED,
      index: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.transactionId || ret._id.toString();
        ret.paymentId = ret.transactionId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
