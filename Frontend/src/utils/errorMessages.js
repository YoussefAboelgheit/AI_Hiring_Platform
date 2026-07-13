// كل رسايل الاخطاء اللي بتتعرض للمستخدم بتعدي من هنا
// عشان محدش يشوف رسايل الباك اند الخام (زي quota بتاعة الـ AI أو أي تفاصيل تقنية)

const AI_ERROR_KEYWORDS = [
  "quota",
  "gemini",
  "rate limit",
  "rate_limit",
  "billing",
  "resource_exhausted",
  "resource exhausted",
  "overloaded",
  "api key",
];

const AI_BUSY_MESSAGE = "The AI server is busy right now. Please try again in a moment.";

export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const status = err?.response?.status;
  const rawMessage = String(err?.response?.data?.message || "").toLowerCase();

  if (AI_ERROR_KEYWORDS.some((keyword) => rawMessage.includes(keyword))) {
    return AI_BUSY_MESSAGE;
  }

  if (status === 401 || status === 403) {
    return "You don't have permission to do this.";
  }

  if (status >= 500) {
    return "Something went wrong on our end. Please try again later.";
  }

  return fallback;
}