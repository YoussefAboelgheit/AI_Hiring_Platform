import { body, param } from "express-validator";
import { DIFFICULTY_LEVELS, ASSESSMENT_TYPES, MIN_QUESTIONS, MAX_QUESTIONS, MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from "../config/assessment.js";

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
  body("durationMinutes")
    .notEmpty().withMessage("durationMinutes is required")
    .isInt({ min: MIN_DURATION_MINUTES, max: MAX_DURATION_MINUTES })
    .withMessage(`durationMinutes must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES}`)
    .toInt(),
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
  body("durationMinutes")
    .optional()
    .isInt({ min: MIN_DURATION_MINUTES, max: MAX_DURATION_MINUTES })
    .withMessage(`durationMinutes must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES}`)
    .toInt(),
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

export const saveAnswerValidator = [
  body("questionId")
    .notEmpty().withMessage("questionId is required")
    .isMongoId().withMessage("Invalid questionId format"),
  body("selectedAnswer")
    .notEmpty().withMessage("selectedAnswer is required"),
];

export const submitAnswerValidator = [];

export const reportViolationValidator = [
  body("type")
    .notEmpty().withMessage("Violation type is required")
    .isIn(["TAB_SWITCH", "FULLSCREEN_EXIT", "COPY", "PASTE", "CUT", "RIGHT_CLICK", "DRAG_START", "DEVTOOLS_SHORTCUT"])
    .withMessage("Invalid violation type"),
];
