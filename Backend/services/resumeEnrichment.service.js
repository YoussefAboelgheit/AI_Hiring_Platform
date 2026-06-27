import ParsedResume from "../models/parsedResume.js";
import { generateEmbeddingsForParsedResume } from "./embedding.service.js";
import HTTPError from "../util/httpError.js";

/**
 * Enrich a parsed resume with embedding storage and status metadata.
 * This runs asynchronously and does not block API responses.
 * @param {string|Object} parsedResumeOrId
 */
export const enrichParsedResume = async (parsedResumeOrId) => {
  let parsedResume;

  if (typeof parsedResumeOrId === "string") {
    parsedResume = await ParsedResume.findById(parsedResumeOrId);
  } else {
    parsedResume = parsedResumeOrId;
  }

  if (!parsedResume) {
    throw new HTTPError(404, "ParsedResume not found");
  }

  if (!parsedResume.parsedData) {
    throw new HTTPError(400, "ParsedResume missing parsedData");
  }

  await ParsedResume.findByIdAndUpdate(parsedResume._id, {
    embeddingStatus: "pending",
    lastEmbeddedAt: null,
    embeddingId: null,
  });

  try {
    const vectorRow = await generateEmbeddingsForParsedResume(parsedResume._id);
    return vectorRow;
  } catch (error) {
    await ParsedResume.findByIdAndUpdate(parsedResume._id, {
      embeddingStatus: "failed",
      lastEmbeddedAt: new Date(),
    });
    throw error;
  }
};
