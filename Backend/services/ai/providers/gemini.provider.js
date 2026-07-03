import { callGeminiJson } from "../geminiClient.js";

export const name = "gemini";

export const generateContent = async (prompt, options = {}) => {
  return callGeminiJson(prompt, {
    temperature: options.temperature ?? 0.2,
  });
};
