import { query, param } from "express-validator";


export const paginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
    .toInt(),
];


export const idParamValidator = [
  param("id")
    .notEmpty().withMessage("ID param is required")
    .isMongoId().withMessage("Invalid ID format - must be a valid MongoDB ObjectId"),
];


export const courseIdParamValidator = [
  param("courseId")
    .notEmpty().withMessage("courseId param is required")
    .isMongoId().withMessage("Invalid courseId format"),
];


export const lessonIdParamValidator = [
  param("lessonId")
    .notEmpty().withMessage("lessonId param is required")
    .isMongoId().withMessage("Invalid lessonId format"),
];


export const commentIdParamValidator = [
  param("commentId")
    .notEmpty().withMessage("commentId param is required")
    .isMongoId().withMessage("Invalid commentId format"),
];
