import "dotenv/config";

import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import HTTPError from "../../../util/httpError.js";
import { callGeminiJson } from "../geminiClient.js";

/* =========================================================
   GEMINI INIT
========================================================= */

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================================================
   1. DOCUMENT EXTRACTION (UNCHANGED)
========================================================= */

export const extractTextFromDocument = async (buffer, mimeType) => {
  try {
    if (mimeType === "application/pdf") {
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    throw new HTTPError(415, "Unsupported format. Only PDF and DOCX allowed.");
  } catch (err) {
    throw new HTTPError(500, "Failed to extract document text");
  }
};

/* =========================================================
   2. PROMPT BUILDER (IMPROVED FOR GEMINI)
========================================================= */

export const buildResumePrompt = (text) => {
  return `
You are an expert resume parsing engine.

STRICT RULES:
- Return ONLY valid JSON
- No markdown, no explanation, no extra text
- Use null for missing strings
- Use [] for missing arrays
- Do not hallucinate
- Extract all possible structured data

OUTPUT SCHEMA:

{
  "fullName": null,
  "email": null,
  "phone": null,
  "linkedin": null,
  "github": null,
  "website": null,
  "summary": null,
  "skills": [],
  "experience": [
    {
      "title": null,
      "company": null,
      "startDate": null,
      "endDate": null,
      "location": null,
      "description": null
    }
  ],
  "education": [
    {
      "institution": null,
      "degree": null,
      "fieldOfStudy": null,
      "startDate": null,
      "endDate": null,
      "grade": null
    }
  ],
  "certifications": [],
  "languages": [],
  "projects": [
    {
      "name": null,
      "description": null,
      "technologies": [],
      "link": null
    }
  ],
  "awards": []
}

RESUME TEXT:
${text}
`;
};

/* =========================================================
   3. GEMINI CALL (REPLACEMENT FOR OPENAI)
========================================================= */

// export const callGemini = async (prompt) => {
//   if (!process.env.GEMINI_API_KEY) {
//     throw new HTTPError(500, "Gemini API key is not configured");
//   }

//   const model = genAI.getGenerativeModel({
//     model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
//   });

//   try {
//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: prompt }],
//         },
//       ],
//       generationConfig: {
//         temperature: 0,
//         responseMimeType: "application/json", // Gemini  FORCE JSON
//       },
//     });

//     const response = await result.response;
//     const text = response.text();

//     if (!text) {
//       throw new HTTPError(500, "Empty response from Gemini");
//     }

//     return JSON.parse(text);
//   } catch (err) {
//     throw new HTTPError(500, `Gemini request failed: ${err.message}`);
//   }
// };


export const callGemini = async (prompt) => {
  return await callGeminiJson(prompt);
};
/* =========================================================
   4. NORMALIZATION (UNCHANGED)
========================================================= */

const asString = (v) => (typeof v === "string" ? v.trim() : "");
const asArray = (v) =>
  Array.isArray(v)
    ? v.map((x) => (typeof x === "string" ? x.trim() : String(x)))
    : [];

export const normalizeResume = (raw) => {
  return {
    fullName: asString(raw.fullName),
    email: asString(raw.email),
    phone: asString(raw.phone),
    linkedin: asString(raw.linkedin),
    github: asString(raw.github),
    website: asString(raw.website),
    summary: asString(raw.summary),

    skills: asArray(raw.skills),
    certifications: asArray(raw.certifications),
    languages: asArray(raw.languages),
    awards: asArray(raw.awards),

    experience: Array.isArray(raw.experience)
      ? raw.experience.map((e) => ({
          title: asString(e.title),
          company: asString(e.company),
          startDate: asString(e.startDate),
          endDate: asString(e.endDate),
          location: asString(e.location),
          description: asString(e.description),
        }))
      : [],

    education: Array.isArray(raw.education)
      ? raw.education.map((e) => ({
          institution: asString(e.institution),
          degree: asString(e.degree),
          fieldOfStudy: asString(e.fieldOfStudy),
          startDate: asString(e.startDate),
          endDate: asString(e.endDate),
          grade: asString(e.grade),
        }))
      : [],

    projects: Array.isArray(raw.projects)
      ? raw.projects.map((p) => ({
          name: asString(p.name),
          description: asString(p.description),
          technologies: asArray(p.technologies),
          link: asString(p.link),
        }))
      : [],
  };
};

/* =========================================================
   5. VALIDATION (UNCHANGED)
========================================================= */

export const validateParsedResume = (rawData) => {
  const data = normalizeResume(rawData);
  const errors = [];

  if (
    !data.fullName &&
    !data.email &&
    !data.skills.length &&
    !data.experience.length &&
    !data.education.length
  ) {
    errors.push("No meaningful resume data extracted.");
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format.");
  }

  if (data.phone && !/^[+0-9()\s-]{6,40}$/.test(data.phone)) {
    errors.push("Invalid phone format.");
  }

  return { data, errors };
};

/* =========================================================
   6. MAIN PIPELINE (ENTRY POINT)
========================================================= */

export const parseResumeWithAI = async (buffer, mimeType) => {
  const text = await extractTextFromDocument(buffer, mimeType);

  if (!text || text.trim().length < 10) {
    throw new HTTPError(400, "Empty document content");
  }

  const prompt = buildResumePrompt(text);

  // ONLY CHANGE: Gemini instead of OpenAI
  const rawResult = await callGemini(prompt);

  const { data, errors } = validateParsedResume(rawResult);

  if (errors.length > 0) {
    throw new HTTPError(422, {
      message: "Validation failed",
      errors,
    });
  }

  return data;
};
