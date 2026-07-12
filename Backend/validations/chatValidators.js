import { body, param } from "express-validator";

export const createConversationValidator = [
  body("type")
    .notEmpty().withMessage("Conversation type is required")
    .isIn(["general", "mock_interview"])
    .withMessage("Type must be 'general' or 'mock_interview'"),
  body("jobId")
    .optional({ nullable: true, values: "null" })
    .isMongoId().withMessage("Invalid jobId format"),
];

export const sendMessageValidator = [
  param("id")
    .notEmpty().withMessage("Conversation ID is required")
    .isMongoId().withMessage("Invalid conversation ID format"),
  body("content")
    .notEmpty().withMessage("Message content is required")
    .isString().withMessage("Message content must be a string")
    .trim(),
];

export const conversationIdParamValidator = [
  param("id")
    .notEmpty().withMessage("Conversation ID is required")
    .isMongoId().withMessage("Invalid conversation ID format"),
];
