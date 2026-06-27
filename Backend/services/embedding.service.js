import HTTPError from "../util/httpError.js";
import ParsedJob from "../models/parsedJob.js";
import ParsedResume from "../models/parsedResume.js";
import { upsertJobEmbedding } from "./vector.service.js";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "gemini-embedding-001";

const normalizeString = (value) =>
  typeof value === "string" && value.trim().length ? value.trim() : null;

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : String(item)))
        .filter(Boolean)
    : [];

const buildJobEmbeddingText = (parsedJob) => {
  const lines = [];
  lines.push(`Title: ${normalizeString(parsedJob.title) || ""}`);
  lines.push(`Category: ${normalizeString(parsedJob.category) || ""}`);
  lines.push(
    `Employment Type: ${normalizeString(parsedJob.employmentType) || ""}`,
  );
  lines.push(`Location: ${normalizeString(parsedJob.location) || ""}`);
  lines.push(`Salary: ${normalizeString(parsedJob.salary) || ""}`);

  if (parsedJob.requiredSkills.length) {
    lines.push("Required Skills:");
    lines.push(parsedJob.requiredSkills.join("\n"));
  }
  if (parsedJob.preferredSkills.length) {
    lines.push("Preferred Skills:");
    lines.push(parsedJob.preferredSkills.join("\n"));
  }
  if (parsedJob.responsibilities.length) {
    lines.push("Responsibilities:");
    lines.push(parsedJob.responsibilities.join("\n"));
  }
  if (parsedJob.benefits.length) {
    lines.push("Benefits:");
    lines.push(parsedJob.benefits.join("\n"));
  }
  if (normalizeString(parsedJob.experience)) {
    lines.push(`Experience: ${normalizeString(parsedJob.experience)}`);
  }
  if (normalizeString(parsedJob.education)) {
    lines.push(`Education: ${normalizeString(parsedJob.education)}`);
  }
  if (parsedJob.keywords.length) {
    lines.push("Keywords:");
    lines.push(parsedJob.keywords.join("\n"));
  }

  return lines.filter(Boolean).join("\n\n");
};

const ensureEnv = () => {
  if (!OPENAI_KEY) {
    throw new HTTPError(500, "OPENAI_API_KEY is not configured.");
  }
};

const createOpenAIEmbedding = async (input) => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({ model: OPENAI_EMBEDDING_MODEL, input }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HTTPError(500, `OpenAI embedding failed: ${text}`);
  }

  const body = await response.json();
  if (!body?.data?.[0]?.embedding) {
    throw new HTTPError(500, "OpenAI response missing embedding vector.");
  }

  return body.data[0].embedding;
};

const createEmbedding = async (input) => {
  return await createOpenAIEmbedding(input);
};

/**
 * Convert parsed job JSON into a semantic embedding vector.
 * @param {Object} parsedJob
 * @returns {Promise<number[]>}
 */
export const generateJobEmbedding = async (parsedJob) => {
  ensureEnv();

  const embeddingText = buildJobEmbeddingText(parsedJob);
  if (!embeddingText.trim()) {
    throw new HTTPError(
      500,
      "Parsed job text is empty; cannot generate embedding.",
    );
  }

  return await createEmbedding(embeddingText);
};

const buildResumeEmbeddingText = (parsedResume) => {
  const lines = [];
  if (parsedResume.summary) lines.push(`Summary: ${parsedResume.summary}`);
  if (parsedResume.skills?.length) {
    lines.push("Skills:");
    lines.push(parsedResume.skills.join("\n"));
  }
  if (parsedResume.experience?.length) {
    lines.push("Experience:");
    parsedResume.experience.forEach((item) => {
      const title = item.title || "";
      const company = item.company || "";
      const description = item.description || "";
      lines.push(`${title} at ${company}`.trim());
      if (description) lines.push(description);
    });
  }
  if (parsedResume.education?.length) {
    lines.push("Education:");
    parsedResume.education.forEach((item) => {
      const educationLine = [item.degree, item.fieldOfStudy, item.institution]
        .filter(Boolean)
        .join(" - ");
      if (educationLine) lines.push(educationLine);
    });
  }
  return lines.filter(Boolean).join("\n\n");
};

export const generateResumeEmbedding = async (parsedResume) => {
  ensureEnv();

  const embeddingText = buildResumeEmbeddingText(parsedResume);
  if (!embeddingText.trim()) {
    throw new HTTPError(
      500,
      "Parsed resume text is empty; cannot generate embedding.",
    );
  }

  return await createEmbedding(embeddingText);
};

export const generateEmbeddingsForParsedJob = async (parsedJobId) => {
  const parsedJob = await ParsedJob.findById(parsedJobId);
  if (!parsedJob) {
    throw new HTTPError(404, "ParsedJob not found");
  }

  const embedding = await generateJobEmbedding(parsedJob.parsedData);
  const jobId = parsedJob.job?.toString() || parsedJobId.toString();

  const vectorRow = await upsertJobEmbedding(jobId, embedding, {
    title: parsedJob.parsedData?.title || null,
    category: parsedJob.parsedData?.category || null,
  });

  return vectorRow;
};

export const generateEmbeddingsForParsedResume = async (parsedResumeId) => {
  const parsedResume = await ParsedResume.findById(parsedResumeId);
  if (!parsedResume) {
    throw new HTTPError(404, "ParsedResume not found");
  }

  const embedding = await generateResumeEmbedding(parsedResume.parsedData);
  const resumeId = parsedResume._id.toString();

  const vectorRow = await upsertJobEmbedding(resumeId, embedding, {
    title:
      parsedResume.parsedData?.summary ||
      parsedResume.parsedData?.fullName ||
      null,
    category: "resume",
    documentType: "resume",
    userId: parsedResume.user?.toString?.() ?? null,
  });

  await ParsedResume.findByIdAndUpdate(parsedResumeId, {
    embeddingId: vectorRow?.id?.toString?.() ?? null,
    embeddingStatus: "ready",
    lastEmbeddedAt: new Date(),
  });

  return vectorRow;
};
