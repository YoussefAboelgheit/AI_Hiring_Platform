import * as chatService from "../services/chat.service.js";

export const createConversation = async (req, res, next) => {
  try {
    const { type, jobId } = req.body;
    const conversation = await chatService.createConversation(
      req.user._id,
      type,
      jobId || null,
    );
    return res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const result = await chatService.sendMessage(
      req.params.id,
      req.user._id,
      content,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const endInterview = async (req, res, next) => {
  try {
    const result = await chatService.endInterview(
      req.params.id,
      req.user._id,
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getConversations(req.user._id);
    return res.status(200).json(conversations);
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await chatService.getConversation(
      req.params.id,
      req.user._id,
    );
    return res.status(200).json(conversation);
  } catch (err) {
    next(err);
  }
};
