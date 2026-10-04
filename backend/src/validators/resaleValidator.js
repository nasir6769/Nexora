import { body } from "express-validator";

export const createResaleListingValidator = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be greater than zero"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

export const createResaleRequestValidator = [
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];
