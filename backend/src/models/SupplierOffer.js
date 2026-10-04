import mongoose from "mongoose";

const supplierOfferSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    productId: {
      type: String,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    deliveryDays: {
      type: Number,
      default: 2,
      min: 1,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
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

export const SupplierOffer = mongoose.model("SupplierOffer", supplierOfferSchema);
