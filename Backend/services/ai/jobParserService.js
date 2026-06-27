import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import HTTPError from "../util/httpError.js";
import { callGemini } from "./geminiClient.js";

const parseJson = (value) => {
  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new HTTPError(500, "LLM response did not contain valid JSON.");
  }

  const jsonString = value.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new HTTPError(500, "LLM response could not be parsed as JSON.");
  }
};

export const extractTextFromDocument = async (buffer, mimeType) => {
  if (mimeType === "application/pdf") {
    const { text } = await pdfParse(buffer);
    return text || "";
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || "";
  }

  throw new HTTPError(
    415,
    "Unsupported document format. Only PDF and DOCX are allowed.",
  );
};

export const buildJobPrompt = (text) => {
  return `You are an expert job posting parser. Extract structured job metadata from the text below and return ONLY valid JSON with this schema:\n\n{
  "title": null,
  "description": null,
  "workplace": null,
  "jobType": null,
  "skills": [],
  "requirements": null,
  "location": null,
  "applicationEnd": null,
  "salary": null,
  "company": null
}\n\nIf a field is missing, return null for strings and [] for arrays. Do not include markdown or extra text.\n\nJob text:\n${text}`;
};

const asString = (value) => (typeof value === "string" ? value.trim() : "");
const asArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : String(item)))
        .filter(Boolean)
    : [];

const normalizeParsedJob = (raw) => ({
  title: asString(raw.title),
  description: asString(raw.description),
  workplace: asString(raw.workplace),
  jobType: asString(raw.jobType),
  skills: asArray(raw.skills),
  requirements: asString(raw.requirements),
  location: asString(raw.location),
  applicationEnd: asString(raw.applicationEnd),
  salary: asString(raw.salary),
  company: asString(raw.company),
});

export const validateParsedJob = (rawData) => {
  const data = normalizeParsedJob(rawData);
  const errors = [];

  if (!data.title && !data.description && !data.skills.length) {
    errors.push(
      "Parsed job must contain at least title, description, or skills.",
    );
  }

  if (
    data.workplace &&
    !["Onsite", "Hybrid", "Remote"].includes(data.workplace)
  ) {
    errors.push("workplace must be Onsite, Hybrid, or Remote.");
  }

  return { data, errors };
};

export const parseJobWithAI = async (buffer, mimeType) => {
  const text = await extractTextFromDocument(buffer, mimeType);
  if (!text || !text.trim()) {
    throw new HTTPError(400, "Empty document content");
  }

  const prompt = buildJobPrompt(text);
  const rawText = await callGemini(prompt);
  const parsedObject = parseJson(rawText);

  const { data, errors } = validateParsedJob(parsedObject);
  if (errors.length > 0) {
    const err = new HTTPError(422, "Parsed job JSON failed validation.");
    err.errors = errors;
    throw err;
  }

  return data;
};
