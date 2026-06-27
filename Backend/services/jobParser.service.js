import Category from "../models/category.js";
import HTTPError from "../util/httpError.js";
import { callGemini } from "../services/ai/geminiClient.js";

const JOB_PARSER_SCHEMA = {
  title: null,
  category: null,
  employmentType: null,
  experience: null,
  education: null,
  requiredSkills: [],
  preferredSkills: [],
  responsibilities: [],
  benefits: [],
  location: null,
  salary: null,
  keywords: [],
};

const normalizeString = (value) =>
  typeof value === "string" && value.trim().length ? value.trim() : null;

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : String(item)))
        .filter(Boolean)
    : [];

const buildJobPrompt = (job, categoryName) => {
  const rawFields = {
    title: job.title || null,
    category: categoryName || job.category || null,
    workplace: job.workplace || null,
    jobType: job.jobType || null,
    skills: Array.isArray(job.skills) ? job.skills : [],
    requirements: job.requirements || null,
    location: job.location || null,
    applicationEnd: job.applicationEnd ? job.applicationEnd.toString() : null,
    salary: job.salary || null,
    company: job.company || null,
    description: job.description || null,
  };

  return `You are an expert job posting parser.
Extract the job data from the content below and return ONLY valid JSON matching this schema exactly:

${JSON.stringify(JOB_PARSER_SCHEMA, null, 2)}

Rules:
- Return only JSON.
- Use null for missing string values.
- Use [] for missing arrays.
- Do not add any fields not listed in the schema.
- Do not include comments, markdown, or explanations.
- Preserve arrays when the data is list-like.

Job Input:
${JSON.stringify(rawFields, null, 2)}`;
};

const parseJson = (text) => {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new HTTPError(500, "LLM response did not contain valid JSON.");
  }

  const jsonText = text.slice(first, last + 1);
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    throw new HTTPError(500, "LLM response could not be parsed as JSON.");
  }
};

const ensureSchema = (raw) => ({
  title: normalizeString(raw.title),
  category: normalizeString(raw.category),
  employmentType: normalizeString(raw.employmentType),
  experience: normalizeString(raw.experience),
  education: normalizeString(raw.education),
  requiredSkills: normalizeArray(raw.requiredSkills),
  preferredSkills: normalizeArray(raw.preferredSkills),
  responsibilities: normalizeArray(raw.responsibilities),
  benefits: normalizeArray(raw.benefits),
  location: normalizeString(raw.location),
  salary: normalizeString(raw.salary),
  keywords: normalizeArray(raw.keywords),
});

const validateParsedJob = (parsed) => {
  const normalized = ensureSchema(parsed);
  const errors = [];

  if (
    !normalized.title &&
    !normalized.description &&
    !normalized.requiredSkills.length
  ) {
    errors.push(
      "Parsed job data must include title, description, or requiredSkills.",
    );
  }

  return { data: normalized, errors };
};

const resolveCategoryName = async (job) => {
  if (!job.category) return null;
  if (
    typeof job.category === "string" &&
    job.category.match(/^[0-9a-fA-F]{24}$/)
  ) {
    const category = await Category.findById(job.category).select("name");
    return category?.name || null;
  }
  if (typeof job.category === "object" && job.category?.name) {
    return job.category.name;
  }
  return String(job.category);
};

/**
 * Parse a saved job into normalized structured JSON using the LLM.
 * @param {Object} job - Mongoose job document or plain object
 * @returns {Promise<Object>} parsed job JSON
 */
export const parseJobWithAI = async (job) => {
  const categoryName = await resolveCategoryName(job);
  const prompt = buildJobPrompt(job, categoryName);
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
