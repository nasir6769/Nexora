import mongoose from "mongoose";
import { INVENTORY_STATUS } from "../utils/constants.js";

const inventorySchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: String,
      trim: true,
      default: function () {
        return `prod-${Date.now().toString(36)}`;
      },
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    quantity: {
      type: Number,
      min: [0, "Quantity cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Threshold cannot be negative"],
    },
    expiryDate: {
      type: Date,
    },
    lastSoldDate: {
      type: Date,
      default: Date.now,
    },
    salesVelocity: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(INVENTORY_STATUS),
      default: INVENTORY_STATUS.IN_STOCK,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.productName = ret.productName || ret.name;
        ret.quantity = ret.quantity ?? ret.stock;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-sync productName & quantity & auto-calculate status before saving
inventorySchema.pre("save", function (next) {
  if (this.name && !this.productName) {
    this.productName = this.name;
  }
  if (this.productName && !this.name) {
    this.name = this.productName;
  }
  if (this.stock !== undefined) {
    this.quantity = this.stock;
  } else if (this.quantity !== undefined) {
    this.stock = this.quantity;
  }

  // Determine inventory status if not manually overridden as excess/slow-moving
  if (this.stock <= 0) {
    this.status = INVENTORY_STATUS.OUT_OF_STOCK;
  } else if (this.stock <= this.lowStockThreshold) {
    this.status = INVENTORY_STATUS.LOW_STOCK;
  } else if (![INVENTORY_STATUS.EXCESS, INVENTORY_STATUS.SLOW_MOVING, INVENTORY_STATUS.DEAD_STOCK, INVENTORY_STATUS.EXPIRING].includes(this.status)) {
    this.status = INVENTORY_STATUS.IN_STOCK;
  }

  next();
});

export const Inventory = mongoose.model("Inventory", inventorySchema);
