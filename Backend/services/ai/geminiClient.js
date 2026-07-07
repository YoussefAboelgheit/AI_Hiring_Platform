import { GoogleGenerativeAI } from "@google/generative-ai";
import HTTPError from "../../util/httpError.js";

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 700;
const DEFAULT_TIMEOUT_MS = 30000;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async (promise, timeoutMs, message) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new HTTPError(504, message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const isRetryableGeminiError = (err) => {
  if (err instanceof HTTPError && err.status < 500 && err.status !== 429) {
    return false;
  }

  const status = err.status || err.statusCode;
  if (status === 429 || status >= 500) return true;

  const message = String(err.message || "").toLowerCase();
  return [
    "empty response",
    "fetch failed",
    "network",
    "timeout",
    "timed out",
    "unavailable",
    "overloaded",
    "rate limit",
    "503",
    "500",
  ].some((pattern) => message.includes(pattern));
};

const parseJsonResponse = (text) => {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
    } catch {}
  }

  throw new HTTPError(500, "Gemini response did not contain valid JSON.");
};

export const callGemini = async (prompt, options = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new HTTPError(500, "Gemini API key is not configured.");
  }

  const model = options.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const maxAttempts = toPositiveInteger(
    process.env.GEMINI_MAX_ATTEMPTS || process.env.GEMINI_MAX_RETRIES,
    DEFAULT_MAX_ATTEMPTS,
  );
  const retryDelayMs = toPositiveInteger(
    process.env.GEMINI_RETRY_DELAY_MS,
    DEFAULT_RETRY_DELAY_MS,
  );
  const timeoutMs = toPositiveInteger(
    process.env.GEMINI_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  );

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const geminiModel = genAI.getGenerativeModel({ model });
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await withTimeout(
        geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0,
            responseMimeType: options.responseMimeType || "application/json",
          },
        }),
        timeoutMs,
        `Gemini request timed out after ${timeoutMs}ms`,
      );

      const response = await result.response;
      const text = await response.text();

      if (!text) {
        throw new HTTPError(500, "Empty response from Gemini");
      }

      return options.parseJson ? parseJsonResponse(text) : text;
    } catch (err) {
      lastError = err;

      if (attempt >= maxAttempts || !isRetryableGeminiError(err)) {
        break;
      }

      await sleep(retryDelayMs * 2 ** (attempt - 1));
    }
  }

  throw new HTTPError(
    500,
    `Gemini request failed after ${maxAttempts} attempt(s): ${lastError?.message || "Unknown error"}`,
  );
};

export const callGeminiJson = async (prompt, options = {}) =>
  callGemini(prompt, { ...options, parseJson: true });
