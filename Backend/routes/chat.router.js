import { Router } from "express";
import authMW from "../middlewares/authMW.js";
import { authorize } from "../middlewares/authorizeMW.js";
import validateResults from "../validations/validateResults.js";
import {
  createConversationValidator,
  sendMessageValidator,
  conversationIdParamValidator,
} from "../validations/chatValidators.js";
import {
  createConversation,
  sendMessage,
  endInterview,
  getConversations,
  getConversation,
} from "../controllers/chat.controller.js";

const router = Router();

router.post(
  "/conversations",
  authMW,
  authorize("candidate"),
  createConversationValidator,
  validateResults,
  createConversation,
);

router.get(
  "/conversations",
  authMW,
  authorize("candidate"),
  getConversations,
);

router.get(
  "/conversations/:id",
  authMW,
  authorize("candidate"),
  conversationIdParamValidator,
  validateResults,
  getConversation,
);

router.post(
  "/conversations/:id/messages",
  authMW,
  authorize("candidate"),
  sendMessageValidator,
  validateResults,
  sendMessage,
);

router.post(
  "/conversations/:id/end",
  authMW,
  authorize("candidate"),
  conversationIdParamValidator,
  validateResults,
  endInterview,
);

export default router;
