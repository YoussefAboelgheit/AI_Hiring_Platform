import apiClient from "./apiClient";

export const createConversation = (payload) =>
  apiClient.post("/chat/conversations", payload);

export const getConversations = () =>
  apiClient.get("/chat/conversations");

export const getConversation = (id) =>
  apiClient.get(`/chat/conversations/${id}`);

export const sendMessage = (conversationId, content) =>
  apiClient.post(`/chat/conversations/${conversationId}/messages`, { content });

export const endInterview = (conversationId) =>
  apiClient.post(`/chat/conversations/${conversationId}/end`);
