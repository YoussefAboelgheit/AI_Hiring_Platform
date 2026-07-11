// Backend messages that mention AI providers, quotas, or retry attempts are internal
// details (e.g. "Gemini failed after 2 attempts") and should never reach the user as-is.
// Anything matching these gets swapped for a plain, friendly message instead.
const TECHNICAL_ERROR_KEYWORDS = [
  "gemini",
  "openai",
  "quota",
  "rate limit",
  "rate_limit",
  "billing",
  "resource_exhausted",
  "resource exhausted",
  "overloaded",
  "api key",
  "failed after",
  "attempts",
  "timeout",
  "econn",
  "internal server error",
];

const SERVER_BUSY_MESSAGE = "The server is busy, please try again later.";

function isTechnicalMessage(message) {
  const normalized = String(message || "").toLowerCase();
  return TECHNICAL_ERROR_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    const fallbackMessage = error?.message || "Something went wrong. Please try again.";
    return isTechnicalMessage(fallbackMessage) ? SERVER_BUSY_MESSAGE : fallbackMessage;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    const msg = first.msg || first.message || data.message;
    return isTechnicalMessage(msg) ? SERVER_BUSY_MESSAGE : msg;
  }

  if (typeof data.message === "string") {
    if (data.message.includes("already taken")) {
      return "An account with this email already exists.";
    }
    if (data.message === "Invalid email or password") {
      return "Incorrect email or password.";
    }
    return isTechnicalMessage(data.message) ? SERVER_BUSY_MESSAGE : data.message;
  }

  return "Something went wrong. Please try again.";
}