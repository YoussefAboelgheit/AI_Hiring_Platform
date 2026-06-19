import { body } from "express-validator";


export const createUserValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

  body("role")
    .optional()
    .isIn(["candidate", "hr", "admin"])
    .withMessage("Role must be candidate, hr, or admin"),

  body("bio")
    .optional()
    .isString().withMessage("Bio must be a string")
    .isLength({ max: 300 }).withMessage("Bio cannot exceed 300 characters")
    .trim(),
];


export const updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Name cannot be empty")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("bio")
    .optional()
    .isString().withMessage("Bio must be a string")
    .isLength({ max: 300 }).withMessage("Bio cannot exceed 300 characters")
    .trim(),

  body("role")
    .optional()
    .isIn(["candidate", "hr", "admin"])
    .withMessage("Role must be candidate, hr, or admin"),
];
