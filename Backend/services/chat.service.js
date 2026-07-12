import ChatConversation from "../models/chatConversation.js";
import Job from "../models/job.js";
import JobApplication from "../models/jobApplication.js";
import HTTPError from "../util/httpError.js";
import { callGemini } from "./ai/geminiClient.js";
import {
  buildGeneralChatSystemPrompt,
  buildMockInterviewSystemPrompt,
  buildHistoryPrompt,
} from "./ai/prompts/chat.prompt.js";

export const createConversation = async (candidateId, type, jobId) => {
  let title = type === "general" ? "General Chat" : "Mock Interview";

  if (type === "mock_interview") {
    if (!jobId) {
      throw new HTTPError(400, "Job ID is required for mock interview");
    }

    const application = await JobApplication.findOne({
      candidate: candidateId,
      job: jobId,
    });
    if (!application) {
      throw new HTTPError(403, "You must apply to this job before starting a mock interview");
    }

    const job = await Job.findById(jobId);
    if (!job) {
      throw new HTTPError(404, "Job not found");
    }

    title = `${job.title} Mock Interview`;
  }

  const conversation = await ChatConversation.create({
    candidate: candidateId,
    type,
    job: jobId || null,
    title,
    messages: [],
    status: "active",
  });

  return conversation;
};

export const sendMessage = async (conversationId, candidateId, content) => {
  const conversation = await ChatConversation.findOne({
    _id: conversationId,
    candidate: candidateId,
  });

  if (!conversation) {
    throw new HTTPError(404, "Conversation not found");
  }

  if (conversation.status === "completed") {
    throw new HTTPError(400, "This conversation has ended");
  }

  const userMessage = { role: "user", content };
  conversation.messages.push(userMessage);

  let systemPrompt;
  if (conversation.type === "general") {
    systemPrompt = buildGeneralChatSystemPrompt();
  } else {
    const job = await Job.findById(conversation.job);
    systemPrompt = buildMockInterviewSystemPrompt({
      job: job || {},
      isEnding: false,
    });
  }

  const history = buildHistoryPrompt(conversation.messages);
  const fullPrompt = `${systemPrompt}\n\n--- Conversation History ---\n\n${history}`;

  const aiResponse = await callGemini(fullPrompt, {
    temperature: 0.7,
    responseMimeType: "text/plain",
  });

  const assistantMessage = { role: "assistant", content: aiResponse };
  conversation.messages.push(assistantMessage);
  await conversation.save();

  return {
    conversationId: conversation._id,
    userMessage,
    assistantMessage,
  };
};

export const endInterview = async (conversationId, candidateId) => {
  const conversation = await ChatConversation.findOne({
    _id: conversationId,
    candidate: candidateId,
    type: "mock_interview",
    status: "active",
  });

  if (!conversation) {
    throw new HTTPError(404, "Active mock interview not found");
  }

  const job = await Job.findById(conversation.job);

  const systemPrompt = buildMockInterviewSystemPrompt({
    job: job || {},
    isEnding: true,
  });

  const history = buildHistoryPrompt(conversation.messages);
  const fullPrompt = `${systemPrompt}\n\n--- Interview History ---\n\n${history}`;

  const aiResponse = await callGemini(fullPrompt, {
    temperature: 0.7,
    responseMimeType: "text/plain",
  });

  const summaryMessage = { role: "assistant", content: aiResponse };
  conversation.messages.push(summaryMessage);
  conversation.status = "completed";
  await conversation.save();

  return {
    conversationId: conversation._id,
    summary: aiResponse,
    conversation,
  };
};

export const getConversations = async (candidateId) => {
  const conversations = await ChatConversation.find({ candidate: candidateId })
    .select("-messages")
    .sort({ updatedAt: -1 });
  return conversations;
};

export const getConversation = async (conversationId, candidateId) => {
  const conversation = await ChatConversation.findOne({
    _id: conversationId,
    candidate: candidateId,
  });

  if (!conversation) {
    throw new HTTPError(404, "Conversation not found");
  }

  return conversation;
};
