import mongoose from "mongoose";

const supplierProductSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    supplierName: {
      type: String,
      trim: true,
      default: "",
    },
    productId: {
      type: String,
      trim: true,
      default: function () {
        return `sup-prod-${Date.now().toString(36)}`;
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
    availableStock: {
      type: Number,
      min: [0, "Available stock cannot be negative"],
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, "MOQ must be at least 1"],
    },
    estimatedDeliveryDays: {
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
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
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
        ret.productName = ret.productName || ret.name;
        ret.name = ret.name || ret.productName;
        ret.availableStock = ret.availableStock ?? ret.stock;
        ret.stock = ret.stock ?? ret.availableStock;
        delete ret.__v;
        return ret;
      },
    },
  }
);

supplierProductSchema.pre("save", function (next) {
  if (this.name && !this.productName) {
    this.productName = this.name;
  }
  if (this.productName && !this.name) {
    this.name = this.productName;
  }
  if (this.stock !== undefined && this.availableStock === undefined) {
    this.availableStock = this.stock;
  } else if (this.availableStock !== undefined && this.stock === undefined) {
    this.stock = this.availableStock;
  }
  next();
});

export const SupplierProduct = mongoose.model("SupplierProduct", supplierProductSchema);
