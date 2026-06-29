import Job from "../models/job.js";
import JobApplication from "../models/jobApplication.js";
import ParsedResume from "../models/parsedResume.js";
import User from "../models/user.js";
import HTTPError from "../util/httpError.js";
import { parseResumeWithAI } from "./ai/parsing/resumeParserService.js";
import {
  cosineSimilarity,
  similarityToScore,
} from "./embedding.service.js";
import { enrichJob } from "./jobEnrichment.service.js";
import { enrichParsedResume } from "./resumeEnrichment.service.js";

const inferMimeTypeFromUrl = (url) => {
  const cleanUrl = String(url || "").split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".pdf")) return "application/pdf";
  if (cleanUrl.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/pdf";
};

const downloadFileBuffer = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new HTTPError(500, "Unable to download profile CV for parsing.");
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const createParsedResumeFromFile = async ({ file, userId, source }) => {
  const parsedData = await parseResumeWithAI(file.buffer, file.mimetype);
  const parsedResume = await ParsedResume.create({
    originalFileName: file.originalname || "profile-cv",
    contentType: file.mimetype,
    size: file.size || file.buffer.length,
    source,
    parsedData,
    user: userId,
    embeddingStatus: "pending",
  });

  await enrichParsedResume(parsedResume);
  return await ParsedResume.findById(parsedResume._id);
};

const getParsedResumeForApplication = async ({ user, uploadedCV }) => {
  if (uploadedCV) {
    return await createParsedResumeFromFile({
      file: uploadedCV,
      userId: user._id,
      source: "upload",
    });
  }

  if (user.parsedResumeId) {
    const parsedResume = await ParsedResume.findById(user.parsedResumeId);
    if (parsedResume?.embedding?.length) return parsedResume;

    if (parsedResume) {
      await enrichParsedResume(parsedResume);
      return await ParsedResume.findById(parsedResume._id);
    }
  }

  if (!user.CV) {
    throw new HTTPError(400, "Please upload a CV to apply for this job");
  }

  const buffer = await downloadFileBuffer(user.CV);
  const parsedResume = await createParsedResumeFromFile({
    file: {
      buffer,
      mimetype: inferMimeTypeFromUrl(user.CV),
      originalname: "profile-cv",
      size: buffer.length,
    },
    userId: user._id,
    source: "user-cv",
  });

  await User.findByIdAndUpdate(user._id, { parsedResumeId: parsedResume._id });
  return parsedResume;
};

const ensureJobEmbedding = async (jobId) => {
  let job = await Job.findById(jobId);
  if (!job) throw new HTTPError(404, "Job not found");

  if (job.embedding?.length && job.embeddingStatus === "ready") {
    return job;
  }

  await enrichJob(job);
  job = await Job.findById(jobId);

  if (!job?.embedding?.length) {
    throw new HTTPError(500, "Job embedding is not ready.");
  }

  return job;
};

export const calculateApplicationMatch = async (applicationId, options = {}) => {
  const application = await JobApplication.findById(applicationId);
  if (!application) throw new HTTPError(404, "Application not found");

  try {
    await JobApplication.findByIdAndUpdate(application._id, {
      matchingStatus: "pending",
      matchingError: "",
    });

    const user = await User.findById(application.candidate);
    if (!user) throw new HTTPError(404, "Candidate not found");

    const parsedResume = await getParsedResumeForApplication({
      user,
      uploadedCV: options.uploadedCV,
    });

    const job = await ensureJobEmbedding(application.job);

    if (!parsedResume.embedding?.length) {
      throw new HTTPError(500, "Resume embedding is not ready.");
    }

    const similarity = cosineSimilarity(job.embedding, parsedResume.embedding);
    const matchScore = similarityToScore(similarity);

    return await JobApplication.findByIdAndUpdate(
      application._id,
      {
        parsedResume: parsedResume._id,
        matchScore,
        matchingStatus: "completed",
        matchingError: "",
        matchedAgainstJobVersion: job.embeddingVersion,
      },
      { new: true },
    );
  } catch (err) {
    await JobApplication.findByIdAndUpdate(application._id, {
      matchingStatus: "failed",
      matchingError: err.message || "Application matching failed.",
    });
    throw err;
  }
};
