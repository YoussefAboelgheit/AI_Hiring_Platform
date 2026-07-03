import Category from "../models/category.js";
import Job from "../models/job.js";
import JobApplication, {
  JOB_DELETED_APPLICATION_STATUS,
} from "../models/jobApplication.js";
import APIFeatures from "../util/apiFeatures.js";
import HTTPError from "../util/httpError.js";
import { uploadToSupabase } from "../util/supabaseClient.js";
import {
  analyzeJobApplication,
  analyzeTopCandidatesForJob,
} from "../services/candidateAnalysis.service.js";
import { calculateApplicationMatch } from "../services/jobApplicationMatching.service.js";
import {
  publishJob,
  publishExpiredDraftJobs,
} from "../services/jobEnrichment.service.js";
import { generateAssessment } from "../services/ai/assessment/assessment.service.js";

const recruiterPopulate = {
  path: "recruiter",
  select: "name email role company_logo profile_image",
};

const categoryPopulate = {
  path: "category",
  select: "name",
};

const allowedJobFields = [
  "category",
  "title",
  "description",
  "workplace",
  "jobType",
  "skills",
  "requirements",
  "location",
  "applicationEnd",
];

function pickJobFields(body) {
  return allowedJobFields.reduce((data, field) => {
    if (body[field] !== undefined) data[field] = body[field];
    return data;
  }, {});
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createJobSnapshot(job) {
  const jobObject = typeof job.toObject === "function" ? job.toObject() : job;
  const { __v, ...snapshot } = jobObject;
  return snapshot;
}

function serializeApplicationForCandidate(application) {
  const applicationObject =
    typeof application.toObject === "function"
      ? application.toObject()
      : application;

  if (!applicationObject.job && applicationObject.jobSnapshot) {
    applicationObject.job = applicationObject.jobSnapshot;
  }

  return sanitizeApplicationForCandidate(applicationObject);
}

function serializeApplicationForHr(application) {
  const applicationObject =
    typeof application.toObject === "function"
      ? application.toObject()
      : application;

  if (!applicationObject.job && applicationObject.jobSnapshot) {
    applicationObject.job = applicationObject.jobSnapshot;
  }

  return sanitizeApplicationForHr(applicationObject);
}

function sanitizeJob(job) {
  if (!job) return job;

  const jobObject = typeof job.toObject === "function" ? job.toObject() : { ...job };
  delete jobObject.embedding;

  return jobObject;
}

function sanitizeParsedResume(parsedResume) {
  if (!parsedResume) return parsedResume;

  const parsedResumeObject =
    typeof parsedResume.toObject === "function"
      ? parsedResume.toObject()
      : { ...parsedResume };

  delete parsedResumeObject.embedding;
  return parsedResumeObject;
}

function sanitizeApplicationForHr(application) {
  if (!application) return application;

  const applicationObject =
    typeof application.toObject === "function"
      ? application.toObject()
      : { ...application };

  if (applicationObject.job) {
    applicationObject.job = sanitizeJob(applicationObject.job);
  }

  if (applicationObject.jobSnapshot) {
    applicationObject.jobSnapshot = sanitizeJob(applicationObject.jobSnapshot);
  }

  if (applicationObject.parsedResume) {
    applicationObject.parsedResume = sanitizeParsedResume(applicationObject.parsedResume);
  }

  delete applicationObject.jobSnapshot;
  return applicationObject;
}

function sanitizeApplicationForCandidate(application) {
  if (!application) return application;

  const applicationObject =
    typeof application.toObject === "function"
      ? application.toObject()
      : { ...application };

  if (applicationObject.job) {
    applicationObject.job = sanitizeJob(applicationObject.job);
  }

  if (applicationObject.jobSnapshot) {
    applicationObject.jobSnapshot = sanitizeJob(applicationObject.jobSnapshot);
  }

  if (applicationObject.parsedResume) {
    applicationObject.parsedResume = sanitizeParsedResume(applicationObject.parsedResume);
  }

  delete applicationObject.jobSnapshot;
  delete applicationObject.assessmentScore;
  delete applicationObject.assessmentStatus;
  delete applicationObject.aiEvaluation;
  return applicationObject;
}

function sortApplicationsByMatch(applications) {
  return applications.sort((a, b) => {
    const scoreA = typeof a.matchScore === "number" ? a.matchScore : -1;
    const scoreB = typeof b.matchScore === "number" ? b.matchScore : -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const asA = typeof a.assessmentScore === "number" ? a.assessmentScore : -1;
    const asB = typeof b.assessmentScore === "number" ? b.assessmentScore : -1;
    if (asB !== asA) return asB - asA;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

export const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      ...pickJobFields(req.body),
      recruiter: req.user._id,
      status: "Drafted",
      isPublished: false,
      acceptApplications: false,
      editableUntil: new Date(Date.now() + 5 * 60 * 1000),
      embeddingStatus: "pending",
    });

    setTimeout(() => {
      publishExpiredDraftJobs({ jobId: job._id }).catch((err) =>
        console.error("Scheduled job publishing failed:", err?.message || err),
      );
    }, Math.max(0, job.editableUntil.getTime() - Date.now()));

    const assessmentQuestionCount = req.body.assessmentQuestionCount;
    if (assessmentQuestionCount) {
      generateAssessment({
        jobId: job._id,
        questionCount: assessmentQuestionCount,
        difficulty: req.body.assessmentDifficulty || "Auto",
        topics: req.body.assessmentTopics || "",
        userId: req.user._id,
      }).catch((err) =>
        console.error("Auto-assessment generation failed:", err?.message || err),
      );
    }

    const populatedJob = await Job.findById(job._id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    return res.status(201).json({
      message: "Job created successfully.",
      job: sanitizeJob(populatedJob),
    });
  } catch (err) {
    next(err);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs();

    let baseFilter = { status: "Open" };

    if (req.user?.role === "admin") {
      baseFilter = {};
    } else     if (req.user?.role === "hr" && req.query.status === "Drafted") {
      baseFilter = { recruiter: req.user._id, status: "Drafted" };
    } else if (req.user?.role === "hr" && req.query.status === "Open") {
      baseFilter = { recruiter: req.user._id, status: "Open" };
    }

    const features = new APIFeatures(Job.find(baseFilter), req.query)
      .filter()
      .search(["title", "description", "requirements", "location", "skills"])
      .sort()
      .paginate()
      .limitFields()
      .populate([recruiterPopulate, categoryPopulate]);

    const jobs = await features.query;

    return res.status(200).json({ jobs: jobs.map(sanitizeJob) });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs({ jobId: req.params.id });

    const job = await Job.findById(req.params.id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    if (!job) return next(new HTTPError(404, "Job not found"));

    const isOwner =
      req.user &&
      (req.user.role === "admin" ||
        job.recruiter._id.toString() === req.user._id.toString());

    if (!isOwner && job.status !== "Open") {
      return next(new HTTPError(404, "Job not found"));
    }

    return res.status(200).json({ job: sanitizeJob(job) });
  } catch (err) {
    next(err);
  }
};


//@desc get job enrichment parsed job,embiddingId,embeddingStatus,lastEmbeddedAt
//@route GET /api/jobs/:id/enrichment
export const getJobEnrichment = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs({ jobId: req.params.id });

    const job = await Job.findById(req.params.id).select(
      "parsedJob embeddingId embeddingProvider embeddingStatus embeddingVersion lastEmbeddedAt isEdited editedAt",
    );

    if (!job) return next(new HTTPError(404, "Job not found"));

    return res.status(200).json({
      parsedJob: job.parsedJob || {},
      embeddingId: job.embeddingId,
      embeddingProvider: job.embeddingProvider,
      embeddingStatus: job.embeddingStatus,
      embeddingVersion: job.embeddingVersion,
      lastEmbeddedAt: job.lastEmbeddedAt,
      isEdited: job.isEdited,
      editedAt: job.editedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const getJobsByCategory = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs();

    const categoryName = req.params.category;
    const categoryRegex = new RegExp(`^${escapeRegExp(categoryName)}$`, "i");
    const categories = await Category.find({ name: categoryRegex }).select(
      "_id",
    );

    if (categories.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    let baseFilter = {
      category: { $in: categories.map((c) => c._id) },
      status: "Open",
    };

    if (req.user?.role === "admin") {
      baseFilter = {
        category: { $in: categories.map((c) => c._id) },
      };
    } else if (req.user?.role === "hr") {
      const hrFilter = {
        category: { $in: categories.map((c) => c._id) },
        recruiter: req.user._id,
      };

      if (req.query.status === "Drafted") {
        hrFilter.status = "Drafted";
      } else {
        hrFilter.status = "Open";
      }

      baseFilter = hrFilter;
    }

    const jobs = await Job.find(baseFilter)
      .populate(recruiterPopulate)
      .populate(categoryPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({ jobs: jobs.map(sanitizeJob) });
  } catch (err) {
    next(err);
  }
};

export const getMyAppliedJobs = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ candidate: req.user._id })
      .populate({
        path: "job",
        populate: [recruiterPopulate, categoryPopulate],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      applications: applications.map(serializeApplicationForCandidate),
    });
  } catch (err) {
    next(err);
  }
};

export const getMyApplicationById = async (req, res, next) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      candidate: req.user._id,
    })
      .populate({
        path: "job",
        populate: [recruiterPopulate, categoryPopulate],
      })
      .populate({
        path: "candidate",
        select: "name email role profile_image CV",
      });

    if (!application) return next(new HTTPError(404, "Application not found"));

    return res.status(200).json({
      application: serializeApplicationForCandidate(application),
    });
  } catch (err) {
    next(err);
  }
};

export const getJobApplicationsForHr = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs({ jobId: req.params.id });

    const job = await Job.findById(req.params.id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    if (!job) return next(new HTTPError(404, "Job not found"));

    if (job.recruiter._id.toString() !== req.user._id.toString()) {
      return next(
        new HTTPError(
          403,
          "You can only view applications for jobs you created",
        ),
      );
    }

    const applications = await JobApplication.find({ job: job._id })
      .populate({
        path: "candidate",
        select: "name email role profile_image CV bio",
      })
      .populate("parsedResume")
      .sort({ matchScore: -1, createdAt: 1 });

    return res.status(200).json({
      job: sanitizeJob(job),
      total: applications.length,
      applications: sortApplicationsByMatch(applications).map(sanitizeApplicationForHr),
    });
  } catch (err) {
    next(err);
  }
};

export const getMyJobsWithApplications = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs();

    const jobs = await Job.find({ recruiter: req.user._id })
      .populate(recruiterPopulate)
      .populate(categoryPopulate)
      .sort({ createdAt: -1 });

    const jobIds = jobs.map((job) => job._id);
    const applications = await JobApplication.find({ job: { $in: jobIds } })
      .populate({
        path: "candidate",
        select: "name email role profile_image CV bio",
      })
      .populate("parsedResume")
      .sort({ matchScore: -1, createdAt: 1 });

    const applicationsByJob = applications.reduce(
      (groupedApplications, application) => {
        const jobId = application.job.toString();
        if (!groupedApplications[jobId]) groupedApplications[jobId] = [];
        groupedApplications[jobId].push(application);
        return groupedApplications;
      },
      {},
    );

    const jobsWithApplications = jobs.map((job) => {
      const jobObject = sanitizeJob(job);
      const jobApplications = applicationsByJob[job._id.toString()] || [];

      return {
        ...jobObject,
        applicationsCount: jobApplications.length,
        applications: sortApplicationsByMatch(jobApplications).map(sanitizeApplicationForHr),
      };
    });

    return res.status(200).json({
      totalJobs: jobs.length,
      totalApplications: applications.length,
      jobs: jobsWithApplications,
    });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    if (req.job.status === "Drafted" && req.job.editableUntil && new Date() > req.job.editableUntil) {
      await publishJob(req.job);
      return next(
        new HTTPError(
          400,
          "The 5-minute draft editing period has expired. The job has been published.",
        ),
      );
    }

    if (req.job.status === "Drafted") {
      Object.assign(req.job, pickJobFields(req.body));
      req.job.isEdited = true;
      req.job.editedAt = new Date();
      await req.job.save();

      const job = await Job.findById(req.job._id)
        .populate(recruiterPopulate)
        .populate(categoryPopulate);

      return res.status(200).json({
        message: "Job draft updated successfully.",
        job: sanitizeJob(job),
      });
    }

    return next(
      new HTTPError(
        403,
        "Published jobs cannot be edited by HR.",
      ),
    );
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.job._id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    await JobApplication.updateMany(
      { job: req.job._id },
      {
        status: JOB_DELETED_APPLICATION_STATUS,
        jobSnapshot: createJobSnapshot(job || req.job),
      },
    );

    await req.job.deleteOne();

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const applyToJob = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs({ jobId: req.params.id });

    const job = await Job.findById(req.params.id);
    if (!job) return next(new HTTPError(404, "Job not found"));

    if (job.status !== "Open") {
      return next(new HTTPError(400, "You can only apply to open jobs"));
    }

    if (job.applicationEnd && job.applicationEnd < new Date()) {
      return next(new HTTPError(400, "Applications are closed for this job"));
    }

    const alreadyApplied = await JobApplication.findOne({
      job: job._id,
      candidate: req.user._id,
    });

    if (alreadyApplied) {
      if (alreadyApplied.matchingStatus !== "failed") {
        return next(new HTTPError(409, "You have already applied to this job"));
      }

      const uploadedCV = req.files?.CV?.[0];
      const retryUpdate = {
        matchingStatus: "pending",
        matchingError: "",
        parsedResume: null,
        matchScore: null,
        matchedAgainstJobVersion: null,
        aiEvaluation: {
          strengths: [],
          weaknesses: [],
          summary: "",
          recommendation: "",
          generatedAt: null,
        },
      };

      if (uploadedCV) {
        retryUpdate.CV = await uploadToSupabase(
          uploadedCV.buffer,
          uploadedCV.mimetype,
          "applications/cvs",
        );
      }

      await JobApplication.findByIdAndUpdate(alreadyApplied._id, retryUpdate);
      await calculateApplicationMatch(alreadyApplied._id, { uploadedCV });

      const retriedApplication = await JobApplication.findById(alreadyApplied._id)
        .populate({
          path: "job",
          select: "title status workplace jobType location applicationEnd",
        })
        .populate({
          path: "candidate",
          select: "name email role profile_image CV",
        })
        .populate("parsedResume");

      return res.status(200).json({
        message: "Application parsing and matching retried successfully",
        application: serializeApplicationForCandidate(retriedApplication),
      });
    }

    const uploadedCV = req.files?.CV?.[0];
    const cvUrl = uploadedCV
      ? await uploadToSupabase(
          uploadedCV.buffer,
          uploadedCV.mimetype,
          "applications/cvs",
        )
      : req.user.CV;

    const application = await JobApplication.create({
      job: job._id,
      candidate: req.user._id,
      CV: cvUrl,
      jobSnapshot: createJobSnapshot(job),
      matchingStatus: "pending",
    });

    await calculateApplicationMatch(application._id, { uploadedCV });

    const populatedApplication = await JobApplication.findById(application._id)
      .populate({
        path: "job",
        select: "title status workplace jobType location applicationEnd",
      })
      .populate({
        path: "candidate",
        select: "name email role profile_image CV",
      })
      .populate("parsedResume");

    return res.status(201).json({
      message: "Application submitted successfully",
      application: serializeApplicationForCandidate(populatedApplication),
    });
  } catch (err) {
    next(err);
  }
};


export const analyzeTopJobCandidates = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs({ jobId: req.params.id });

    const job = await Job.findById(req.params.id);
    if (!job) return next(new HTTPError(404, "Job not found"));

    if (req.user.role !== "admin" && job.recruiter.toString() !== req.user._id.toString()) {
      return next(new HTTPError(403, "You can only analyze candidates for jobs you created"));
    }

    const populatedJob = await Job.findById(job._id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);
    const applications = await analyzeTopCandidatesForJob(job._id, 3);

    return res.status(200).json({
      job: sanitizeJob(populatedJob),
      total: applications.length,
      applications: applications.map((application) => {
        const applicationObject = sanitizeApplicationForHr(application);
        delete applicationObject.job;
        return applicationObject;
      }),
    });
  } catch (err) {
    next(err);
  }
};

export const analyzeJobApplicationForHr = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    if (!job) return next(new HTTPError(404, "Job not found"));

    if (req.user.role !== "admin" && job.recruiter._id.toString() !== req.user._id.toString()) {
      return next(new HTTPError(403, "You can only analyze applications for jobs you created"));
    }

    const application = await analyzeJobApplication({
      jobId: job._id,
      applicationId: req.params.applicationId,
    });

    const applicationObject = sanitizeApplicationForHr(application);
    delete applicationObject.job;

    return res.status(200).json({
      job: sanitizeJob(job),
      application: applicationObject,
    });
  } catch (err) {
    next(err);
  }
};

export const retryMyApplicationMatch = async (req, res, next) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      candidate: req.user._id,
    });

    if (!application) return next(new HTTPError(404, "Application not found"));

    if (application.matchingStatus !== "failed") {
      return next(new HTTPError(400, "Only failed application matching can be retried"));
    }

    const uploadedCV = req.files?.CV?.[0];
    const retryUpdate = {
      matchingStatus: "pending",
      matchingError: "",
      parsedResume: null,
      matchScore: null,
      matchedAgainstJobVersion: null,
      aiEvaluation: {
        strengths: [],
        weaknesses: [],
        summary: "",
        recommendation: "",
        generatedAt: null,
      },
    };

    if (uploadedCV) {
      retryUpdate.CV = await uploadToSupabase(
        uploadedCV.buffer,
        uploadedCV.mimetype,
        "applications/cvs",
      );
    }

    await JobApplication.findByIdAndUpdate(application._id, retryUpdate);
    await calculateApplicationMatch(application._id, { uploadedCV });

    const retriedApplication = await JobApplication.findById(application._id)
      .populate({
        path: "job",
        populate: [recruiterPopulate, categoryPopulate],
      })
      .populate({
        path: "candidate",
        select: "name email role profile_image CV",
      })
      .populate("parsedResume");

    return res.status(200).json({
      message: "Application parsing and matching retried successfully",
      application: serializeApplicationForCandidate(retriedApplication),
    });
  } catch (err) {
    next(err);
  }
};


// status change (Admin)
export const adminUpdateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return next(new HTTPError(404, "Job not found"));

    job.status = status;
    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    return res.status(200).json({
      message: "Job status updated successfully",
      job: sanitizeJob(populatedJob),
    });
  } catch (err) {
    next(err);
  }
};

// delete any job by admin
export const adminDeleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    if (!job) return next(new HTTPError(404, "Job not found"));

    await JobApplication.updateMany(
      { job: job._id },
      {
        status: JOB_DELETED_APPLICATION_STATUS,
        jobSnapshot: createJobSnapshot(job),
      },
    );

    await job.deleteOne();

    return res.status(200).json({ message: "Job deleted successfully by admin" });
  } catch (err) {
    next(err);
  }
};
