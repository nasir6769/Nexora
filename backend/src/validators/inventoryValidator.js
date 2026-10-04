import { body, param } from "express-validator";

export const createInventoryValidator = [
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
  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
  body("lowStockThreshold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Low stock threshold must be a non-negative integer"),
];

export const updateQuantityValidator = [
  body("quantity")
    .isInt()
    .withMessage("Quantity adjustment is required and must be an integer"),
  body("reason")
    .optional()
    .trim(),
];
