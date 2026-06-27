import { GoogleGenerativeAI } from "@google/generative-ai";
import HTTPError from "../../util/httpError.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new HTTPError(500, "Gemini API key is not configured.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const geminiModel = genAI.getGenerativeModel({ model });

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = await response.text();

    if (!text) {
      throw new HTTPError(500, "Empty response from Gemini");
    }

    return text;
  } catch (err) {
    throw new HTTPError(500, `Gemini request failed: ${err.message}`);
  }
};
