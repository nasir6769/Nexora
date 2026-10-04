import { body } from "express-validator";

export const createProcurementRequestValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

export const selectSupplierValidator = [
  body("requestId")
    .notEmpty()
    .withMessage("Request ID is required"),
  body("supplierId")
    .notEmpty()
    .withMessage("Supplier ID is required"),
];
