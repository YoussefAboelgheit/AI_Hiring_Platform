import HTTPError from "../util/httpError.js";
import {
  generateEmbeddingsForParsedJob,
  generateEmbeddingsForParsedResume,
} from "../services/embedding.service.js";

const withoutEmbedding = (result) => {
  if (!result || typeof result !== "object") return result;

  const { embedding, ...safeResult } = result;
  if (Array.isArray(embedding)) {
    safeResult.embeddingLength = embedding.length;
  }

  return safeResult;
};

export const generateEmbeddings = async (req, res, next) => {
  try {
    const { parsedResumeId } = req.body;
    if (!parsedResumeId)
      return next(new HTTPError(400, "parsedResumeId is required"));

    const result = await generateEmbeddingsForParsedResume(parsedResumeId);

    return res
      .status(201)
      .json({ message: "Resume embeddings generated", rows: withoutEmbedding(result) });
  } catch (err) {
    next(err);
  }
};

export const generateJobEmbeddings = async (req, res, next) => {
  try {
    const { parsedJobId } = req.body;
    if (!parsedJobId)
      return next(new HTTPError(400, "parsedJobId is required"));

    const result = await generateEmbeddingsForParsedJob(parsedJobId);

    return res
      .status(201)
      .json({ message: "Job embeddings generated", rows: withoutEmbedding(result) });
  } catch (err) {
    next(err);
  }
};

export default { generateEmbeddings, generateJobEmbeddings };
