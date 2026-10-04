import mongoose from "mongoose";
import { INVENTORY_MOVEMENT_TYPE } from "../utils/constants.js";

const inventoryMovementSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(INVENTORY_MOVEMENT_TYPE),
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      trim: true,
      default: "",
    },
    reason: {
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
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const InventoryMovement = mongoose.model("InventoryMovement", inventoryMovementSchema);
