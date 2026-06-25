import { body, param } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Category name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Category name must be between 2 and 50 characters"),
];

export const updateCategoryValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Category name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Category name must be between 2 and 50 characters"),
];

export const categoryIdParamValidator = [
  param("id")
    .notEmpty().withMessage("ID param is required")
    .isMongoId().withMessage("Invalid ID format - must be a valid MongoDB ObjectId"),
];