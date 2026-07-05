import Job from "../models/job.js";
import JobApplication from "../models/jobApplication.js";
import { parseJobWithAI } from "./jobParser.service.js";
import {
  cosineSimilarity,
  generateJobEmbedding,
  getEmbeddingProvider,
  similarityToScore,
} from "./embedding.service.js";

/**
 * Enrich a job record with parsed JSON and a MongoDB-stored embedding.
 * This runs asynchronously and does not block API responses.
 * @param {Object} job
 */
export const enrichJob = async (job, options = {}) => {
  try {
    const parsedJob = await parseJobWithAI(job);
    await Job.findByIdAndUpdate(job._id, {
      parsedJob,
      embeddingStatus: "pending",
    });

    const embedding = await generateJobEmbedding(parsedJob);

    const freshJob = await Job.findById(job._id).select("embeddingVersion");
    const embeddingVersion = (freshJob?.embeddingVersion || 0) + 1;

    await Job.findByIdAndUpdate(job._id, {
      parsedJob,
      embedding,
      embeddingId: null,
      embeddingProvider: getEmbeddingProvider(),
      embeddingStatus: "ready",
      embeddingVersion,
      lastEmbeddedAt: new Date(),
    });

    if (options.recalculateApplications) {
      await recalculateJobApplicationMatches(job._id);
    }
  } catch (error) {
    console.error("Job enrichment pipeline failed:", error?.message ?? error);

    await Job.findByIdAndUpdate(job._id, {
      embeddingStatus: "failed",
      lastEmbeddedAt: new Date(),
    });

    if (options.throwOnError) {
      throw error;
    }
  }
};

export const recalculateJobApplicationMatches = async (jobId) => {
  const job = await Job.findById(jobId).select("embedding embeddingVersion");
  if (!job || !Array.isArray(job.embedding) || job.embedding.length === 0) {
    await JobApplication.updateMany(
      { job: jobId },
      {
        matchingStatus: "failed",
        matchingError: "Job embedding is not ready.",
      },
    );
    return;
  }

  const applications = await JobApplication.find({ job: jobId }).populate("parsedResume");

  await Promise.all(
    applications.map(async (application) => {
      const resumeEmbedding = application.parsedResume?.embedding || [];
      if (!Array.isArray(resumeEmbedding) || resumeEmbedding.length === 0) {
        await JobApplication.findByIdAndUpdate(application._id, {
          matchingStatus: "failed",
          matchingError: "Resume embedding is not ready.",
        });
        return;
      }

      const similarity = cosineSimilarity(job.embedding, resumeEmbedding);
      await JobApplication.findByIdAndUpdate(application._id, {
        matchScore: similarityToScore(similarity),
        matchingStatus: "completed",
        matchingError: "",
        matchedAgainstJobVersion: job.embeddingVersion,
        aiEvaluation: {
          strengths: [],
          weaknesses: [],
          summary: "",
          recommendation: "",
          generatedAt: null,
        },
      });
    }),
  );
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

export const publishJob = async (job) => {
  try {
    const freshJob = await Job.findById(job._id);
    if (!freshJob || freshJob.status !== "Drafted") return;

    const parsedJob = await parseJobWithAI(job);
    const embedding = await generateJobEmbedding(parsedJob);

    const embeddingVersion = (freshJob.embeddingVersion || 0) + 1;

    await Job.findByIdAndUpdate(job._id, {
      parsedJob,
      embedding,
      embeddingId: null,
      embeddingProvider: getEmbeddingProvider(),
      embeddingStatus: "ready",
      embeddingVersion,
      lastEmbeddedAt: new Date(),
      status: "Open",
      isPublished: true,
      acceptApplications: true,
      editableUntil: null,
    });
  } catch (error) {
    console.error("Job publishing pipeline failed:", error?.message ?? error);

    await Job.findByIdAndUpdate(job._id, {
      embeddingStatus: "failed",
      lastEmbeddedAt: new Date(),
      status: "Open",
      isPublished: true,
      acceptApplications: true,
      editableUntil: null,
    });
  }
};

export const publishExpiredDraftJobs = async ({ jobId } = {}) => {
  const filter = {
    status: "Drafted",
    editableUntil: { $ne: null, $lte: new Date() },
  };

  if (jobId) filter._id = jobId;

  const jobs = await Job.find(filter);
  await Promise.all(jobs.map((job) => publishJob(job)));
};

export const closeExpiredJobs = async ({ jobId } = {}) => {
  const filter = {
    status: "Open",
    applicationEnd: { $ne: null, $lte: new Date() },
  };
  if (jobId) filter._id = jobId;
  await Job.updateMany(filter, {
    status: "Closed",
    acceptApplications: false,
  });
};
