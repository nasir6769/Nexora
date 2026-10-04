import { body } from "express-validator";

export const createSupplierProductValidator = [
  body("name")
    .optional()
    .trim(),
  body("productName")
    .optional()
    .trim(),
  body().custom((value, { req }) => {
    if (!req.body.name && !req.body.productName) {
      throw new Error("Product name is required");
    }
    return true;
  }),
  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("availableStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Available stock must be a non-negative integer"),
  body("minimumOrderQuantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Minimum order quantity must be at least 1"),
];
