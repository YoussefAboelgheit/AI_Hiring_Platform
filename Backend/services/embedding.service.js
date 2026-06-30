import HTTPError from "../util/httpError.js";
import ParsedJob from "../models/parsedJob.js";
import ParsedResume from "../models/parsedResume.js";

const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || "ollama";
const OLLAMA_EMBED_URL =
  process.env.OLLAMA_EMBED_URL || "http://localhost:11434/api/embed";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const DEFAULT_EMBEDDING_TIMEOUT_MS = 30000;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getEmbeddingTimeoutMs = () =>
  toPositiveInteger(process.env.EMBEDDING_TIMEOUT_MS, DEFAULT_EMBEDDING_TIMEOUT_MS);

const fetchWithTimeout = async (url, options = {}) => {
  const timeoutMs = getEmbeddingTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new HTTPError(504, `Embedding request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

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

export const getEmbeddingProvider = () => EMBEDDING_PROVIDER;

const ensureEnv = () => {
  if (EMBEDDING_PROVIDER === "ollama") return;

  if (!OPENAI_KEY) {
    throw new HTTPError(500, "OPENAI_API_KEY is not configured.");
  }
};

const createOllamaEmbedding = async (input) => {
  const response = await fetchWithTimeout(OLLAMA_EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HTTPError(500, `Ollama embedding failed: ${text}`);
  }

  const body = await response.json();
  const embedding = body.embedding || body.embeddings?.[0] || body.data?.[0]?.embedding || body.data?.[0];

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new HTTPError(500, "Ollama response missing embedding vector.");
  }

  return embedding;
};

const createOpenAIEmbedding = async (input) => {
  const response = await fetchWithTimeout("https://api.openai.com/v1/embeddings", {
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
  if (EMBEDDING_PROVIDER === "ollama") {
    return await createOllamaEmbedding(input);
  }

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
  await ParsedJob.findByIdAndUpdate(parsedJobId, {
    embeddingRefs: [],
  });

  return {
    parsedJobId: parsedJob._id,
    embedding,
    embeddingProvider: EMBEDDING_PROVIDER,
  };
};

export const generateEmbeddingsForParsedResume = async (parsedResumeId) => {
  const parsedResume = await ParsedResume.findById(parsedResumeId);
  if (!parsedResume) {
    throw new HTTPError(404, "ParsedResume not found");
  }

  const embedding = await generateResumeEmbedding(parsedResume.parsedData);

  await ParsedResume.findByIdAndUpdate(parsedResumeId, {
    embedding,
    embeddingProvider: EMBEDDING_PROVIDER,
    embeddingId: null,
    embeddingStatus: "ready",
    lastEmbeddedAt: new Date(),
  });

  return {
    parsedResumeId: parsedResume._id,
    embedding,
    embeddingProvider: EMBEDDING_PROVIDER,
  };
};

export const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;

  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
};

export const similarityToScore = (similarity) =>
  Math.max(0, Math.min(100, Math.round(((similarity + 1) / 2) * 10000) / 100));
