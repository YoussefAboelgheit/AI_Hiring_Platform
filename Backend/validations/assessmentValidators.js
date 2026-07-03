import { body, param } from "express-validator";
import { DIFFICULTY_LEVELS, ASSESSMENT_TYPES, MIN_QUESTIONS, MAX_QUESTIONS } from "../config/assessment.js";

export const jobIdParamValidator = [
  param("jobId")
    .notEmpty().withMessage("jobId param is required")
    .isMongoId().withMessage("Invalid jobId format"),
];

export const questionIdParamValidator = [
  param("questionId")
    .notEmpty().withMessage("questionId param is required")
    .isMongoId().withMessage("Invalid questionId format"),
];

export const generateAssessmentValidator = [
  body("questionCount")
    .notEmpty().withMessage("questionCount is required")
    .isInt({ min: MIN_QUESTIONS, max: MAX_QUESTIONS })
    .withMessage(`questionCount must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`)
    .toInt(),
  body("difficulty")
    .optional({ nullable: true })
    .isIn(DIFFICULTY_LEVELS)
    .withMessage(`Difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`),
  body("topics")
    .optional({ nullable: true })
    .isString().withMessage("Topics must be a string")
    .trim(),
];

export const updateAssessmentSettingsValidator = [
  body("type")
    .optional()
    .isIn(ASSESSMENT_TYPES)
    .withMessage(`Type must be one of: ${ASSESSMENT_TYPES.join(", ")}`),
  body("questionCount")
    .optional({ nullable: true })
    .isInt({ min: MIN_QUESTIONS, max: MAX_QUESTIONS })
    .withMessage(`questionCount must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`)
    .toInt(),
  body("difficulty")
    .optional({ nullable: true })
    .isIn(DIFFICULTY_LEVELS)
    .withMessage(`Difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`),
  body("topics")
    .optional({ nullable: true })
    .isString().withMessage("Topics must be a string")
    .trim(),
];

export const addQuestionValidator = [
  body("question")
    .notEmpty().withMessage("Question is required"),
  body("options")
    .isArray({ min: 4, max: 4 }).withMessage("Must have exactly 4 options"),
  body("options.*")
    .isString().withMessage("Each option must be a string"),
  body("correctAnswer")
    .notEmpty().withMessage("Correct answer is required"),
  body("explanation")
    .notEmpty().withMessage("Explanation is required"),
  body("topic")
    .optional()
    .isString().withMessage("Topic must be a string"),
  body("difficulty")
    .optional()
    .isIn(DIFFICULTY_LEVELS.filter((d) => d !== "Auto" && d !== "Mixed"))
    .withMessage("Invalid difficulty level"),
];

export const updateQuestionValidator = [
  body("question")
    .optional()
    .notEmpty().withMessage("Question cannot be empty"),
  body("options")
    .optional()
    .isArray({ min: 4, max: 4 }).withMessage("Must have exactly 4 options"),
  body("options.*")
    .optional()
    .isString().withMessage("Each option must be a string"),
  body("correctAnswer")
    .optional()
    .notEmpty().withMessage("Correct answer cannot be empty"),
  body("explanation")
    .optional()
    .notEmpty().withMessage("Explanation cannot be empty"),
  body("topic")
    .optional()
    .notEmpty().withMessage("Topic cannot be empty"),
  body("difficulty")
    .optional()
    .isIn(DIFFICULTY_LEVELS.filter((d) => d !== "Auto" && d !== "Mixed"))
    .withMessage("Invalid difficulty level"),
];

export const submitAnswerValidator = [
  body("answers")
    .isArray({ min: 1 }).withMessage("answers must be a non-empty array"),
  body("answers.*.questionId")
    .isMongoId().withMessage("Each answer must have a valid questionId"),
  body("answers.*.selectedAnswer")
    .notEmpty().withMessage("Each answer must have a selectedAnswer"),
];
