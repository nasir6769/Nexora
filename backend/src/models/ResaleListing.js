import mongoose from "mongoose";
import { RESALE_LISTING_STATUS } from "../utils/constants.js";

const resaleListingSchema = new mongoose.Schema(
  {
    listingId: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return `listing-${Date.now().toString(36)}`;
      },
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerName: {
      type: String,
      trim: true,
      default: "Merchant",
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      index: true,
    },
    productId: {
      type: String,
      trim: true,
      default: function () {
        return `resale-${Date.now().toString(36)}`;
      },
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
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
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    availableQuantity: {
      type: Number,
      min: [0, "Available quantity cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(RESALE_LISTING_STATUS),
      default: RESALE_LISTING_STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.listingId || ret._id.toString();
        ret.merchantName = ret.merchantName || ret.sellerName;
        ret.availableQuantity = ret.availableQuantity ?? ret.quantity;
        delete ret.__v;
        return ret;
      },
    },
  }
);

resaleListingSchema.pre("save", function (next) {
  if (this.availableQuantity === undefined) {
    this.availableQuantity = this.quantity;
  }
  if (this.availableQuantity <= 0) {
    this.status = RESALE_LISTING_STATUS.SOLD;
  }
  next();
});

export const ResaleListing = mongoose.model("ResaleListing", resaleListingSchema);
