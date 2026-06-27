import Job from "../models/job.js";
import { parseJobWithAI } from "./jobParser.service.js";
import { generateJobEmbedding } from "./embedding.service.js";
import { upsertJobEmbedding } from "./vector.service.js";
import HTTPError from "../util/httpError.js";

const buildVectorMetadata = (job) => ({
  jobId: job._id?.toString?.() ?? null,
  title: job.title ?? null,
  category:
    typeof job.category === "object"
      ? (job.category.name ?? null)
      : (job.category ?? null),
  companyId: job.recruiter?.toString?.() ?? null,
});

/**
 * Enrich a job record with parsed JSON and Supabase pgvector embedding.
 * This runs asynchronously and does not block API responses.
 * @param {Object} job
 */
export const enrichJob = async (job) => {
  try {
    const parsedJob = await parseJobWithAI(job);

    const embedding = await generateJobEmbedding(parsedJob);
    const metadata = buildVectorMetadata(job);
    const vectorRow = await upsertJobEmbedding(
      job._id.toString(),
      embedding,
      metadata,
    );

    await Job.findByIdAndUpdate(job._id, {
      parsedJob,
      embeddingId: vectorRow?.id?.toString?.() ?? null,
      embeddingStatus: "ready",
      lastEmbeddedAt: new Date(),
    });
  } catch (error) {
    console.error("Job enrichment pipeline failed:", error?.message ?? error);

    await Job.findByIdAndUpdate(job._id, {
      embeddingStatus: "failed",
      lastEmbeddedAt: new Date(),
    });
  }
};

/**
 * Perform only the parse step and optionally return the parsed structure.
 * Useful for testing or future workflows.
 * @param {Object} job
 */
export const parseAndStoreJob = async (job) => {
  const parsedJob = await parseJobWithAI(job);
  await Job.findByIdAndUpdate(job._id, {
    parsedJob,
    embeddingStatus: "pending",
  });
  return parsedJob;
};
