import HTTPError from "../util/httpError.js";
import { generateEmbeddingsForParsedResume } from "../services/ai/embeddingsService.js";

export const generateEmbeddings = async (req, res, next) => {
  try {
    const { parsedResumeId } = req.body;
    if (!parsedResumeId) return next(new HTTPError(400, "parsedResumeId is required"));

    const result = await generateEmbeddingsForParsedResume(parsedResumeId);

    return res.status(201).json({ message: "Embeddings generated", rows: result });
  } catch (err) {
    next(err);
  }
};

export default { generateEmbeddings };
