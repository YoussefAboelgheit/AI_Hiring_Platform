import SavedJob from "../models/savedJob.js";
import { sendEmail } from "../util/sendEmail.js";
import Category from "../models/category.js";
import Job from "../models/job.js";
import Assessment from "../models/assessment.js";
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
  closeExpiredJobs,
} from "../services/jobEnrichment.service.js";
import { generateAssessment } from "../services/ai/assessment/assessment.service.js";
import { generateCandidateFeedback } from "../services/candidateFeedback.service.js";

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

  const assessmentStatus = applicationObject.assessmentStatus;
  applicationObject.hasAssessment = assessmentStatus !== null && assessmentStatus !== undefined;
  applicationObject.assessmentCompleted = assessmentStatus === "completed";

  delete applicationObject.jobSnapshot;
  delete applicationObject.assessmentScore;
  delete applicationObject.assessmentStatus;
  delete applicationObject.aiEvaluation;
  delete applicationObject.matchScore;
  delete applicationObject.matchingStatus;
  delete applicationObject.matchingError;
  delete applicationObject.matchedAgainstJobVersion;
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
    const saveAsDraft = req.body.saveAsDraft === true;

    const jobData = {
      ...pickJobFields(req.body),
      recruiter: req.user._id,
      status: "Drafted",
      isPublished: false,
      acceptApplications: false,
      embeddingStatus: "pending",
    };

    if (saveAsDraft) {
      jobData.editableUntil = null;
    } else {
      jobData.editableUntil = new Date(Date.now() + 5 * 60 * 1000);
    }

    const job = await Job.create(jobData);

    if (!saveAsDraft && job.editableUntil) {
      setTimeout(() => {
        publishExpiredDraftJobs({ jobId: job._id }).catch((err) =>
          console.error("Scheduled job publishing failed:", err?.message || err),
        );
      }, Math.max(0, job.editableUntil.getTime() - Date.now()));
    }

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
      message: saveAsDraft
        ? "Job saved as draft successfully. You can publish it later."
        : "Job created successfully.",
      job: sanitizeJob(populatedJob),
    });
  } catch (err) {
    next(err);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    await publishExpiredDraftJobs();
    await closeExpiredJobs();

    let baseFilter = { status: "Open" };

    if (req.user?.role === "admin") {
      baseFilter = {};
    } else if (req.user?.role === "hr" && req.query.status === "Drafted") {
      baseFilter = { recruiter: req.user._id, status: "Drafted" };
    } else if (req.user?.role === "hr" && req.query.status === "Open") {
      baseFilter = { recruiter: req.user._id, status: "Open" };
    } else if (req.user?.role === "hr" && req.query.status === "Closed") {
      baseFilter = { recruiter: req.user._id, status: "Closed" };
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
    await closeExpiredJobs({ jobId: req.params.id });

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
    await closeExpiredJobs();

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
      } else if (req.query.status === "Closed") {
        hrFilter.status = "Closed";
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
    await closeExpiredJobs({ jobId: req.params.id });

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
    await closeExpiredJobs();

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
    // ── DRAFTED JOBS ──
    // 1a. If Drafted with a timer and 5-min expired → auto-publish, reject edit
    if (req.job.status === "Drafted" && req.job.editableUntil && new Date() > req.job.editableUntil) {
      await publishJob(req.job);
      return next(
        new HTTPError(400, "The 5-minute draft editing period has expired. The job has been published."),
      );
    }
    // 1b. If Drafted → allow editing fields AND allow manual publish (status → Open)
    if (req.job.status === "Drafted") {
      const { status } = req.body;
      // HR wants to publish the draft → transition to Open
      if (status === "Open") {
        // Timed drafts (saveAsDraft: false) cannot be manually published; must wait 5-min auto-publish
        if (req.job.editableUntil) {
          return next(
            new HTTPError(400, "This draft will auto-publish after the 5-minute editing period. Only persistent drafts (saveAsDraft: true) can be published manually."),
          );
        }
        // Reject publish if applicationEnd is in the past
        if (req.job.applicationEnd && new Date() > req.job.applicationEnd) {
          return next(
            new HTTPError(400, "Cannot publish a job with an application end date in the past. Update the application end date first, then publish."),
          );
        }
        // Check no other fields are sent alongside status
        const otherFields = Object.keys(req.body).filter(key => key !== "status");
        if (otherFields.length > 0) {
          return next(
            new HTTPError(400, "To publish a draft, send only { \"status\": \"Open\" }. Edit the draft fields first in a separate request, then publish."),
          );
        }
        // Publish the job (runs AI parsing + embedding, sets status to Open)
        await publishJob(req.job);
        const job = await Job.findById(req.job._id)
          .populate(recruiterPopulate)
          .populate(categoryPopulate);
        return res.status(200).json({
          message: "Job published successfully.",
          job: sanitizeJob(job),
        });
      }
      // HR wants to edit draft fields (no status change)
      if (status && status !== "Drafted") {
        return next(
          new HTTPError(400, "Drafted jobs can only be changed to Open status."),
        );
      }
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
    // ── OPEN JOBS ──
    if (req.job.status === "Open") {
      // Auto-close if applicationEnd has already passed
      if (req.job.applicationEnd && new Date() > req.job.applicationEnd) {
        req.job.status = "Closed";
        req.job.acceptApplications = false;
        await req.job.save();
        return next(
          new HTTPError(400, "The application deadline has passed. The job has been automatically closed."),
        );
      }
      const { status } = req.body;
      if (!status) {
        return next(
          new HTTPError(403, "Open jobs can only have their status updated. Send { \"status\": \"Closed\" } to close this job."),
        );
      }
      if (status !== "Closed") {
        return next(
          new HTTPError(400, "Open jobs can only be changed to Closed status."),
        );
      }
      // Check if HR sent other fields besides status — reject if so
      const otherFields = Object.keys(req.body).filter(key => key !== "status");
      if (otherFields.length > 0) {
        return next(
          new HTTPError(403, "Open jobs cannot be edited. You can only update the status to Closed."),
        );
      }
      req.job.status = "Closed";
      req.job.acceptApplications = false;
      await req.job.save();
      const job = await Job.findById(req.job._id)
        .populate(recruiterPopulate)
        .populate(categoryPopulate);
      return res.status(200).json({
        message: "Job closed successfully.",
        job: sanitizeJob(job),
      });
    }
    // ── CLOSED JOBS ──
    if (req.job.status === "Closed") {
      return next(
        new HTTPError(403, "Closed jobs cannot be edited or reopened."),
      );
    }
    return next(
      new HTTPError(403, "This job cannot be edited."),
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
    await closeExpiredJobs({ jobId: req.params.id });

    const job = await Job.findById(req.params.id);
    if (!job) return next(new HTTPError(404, "Job not found"));

    if (job.status !== "Open") {
      return next(new HTTPError(400, "You can only apply to open jobs"));
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

    const lockedAssessment = await Assessment.findOne({
      job: job._id,
      status: "Locked",
    });
    if (lockedAssessment) {
      application.assessmentStatus = "not_started";
      application.assessmentDeadline = new Date(
        // Date.now() + 3 * 24 * 60 * 60 * 1000,

        //@desc test for 2 minutes//------------TEST-------------------------
        Date.now() + 7* 60 * 1000,
         
      );
      await application.save();
    }

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

export const getCandidateFeedbackReport = async (req, res, next) => {
  try {
    const feedback = await generateCandidateFeedback({
      applicationId: req.params.applicationId,
      candidateId: req.user._id,
    });

    return res.status(200).json({ feedback });
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

  console.log("adminUpdateJobStatus called ");
  console.log("params:", req.params);
  console.log("body:", req.body);
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

//// belong HR

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { jobId, applicationId } = req.params;

   
    const job = await Job.findById(jobId);
    if (!job) return next(new HTTPError(404, "Job not found"));

    if (req.user.role !== "admin" && job.recruiter.toString() !== req.user._id.toString()) {
      return next(
        new HTTPError(403, "You can only manage applications for your own jobs")
      );
    }

  
    const application = await JobApplication.findOne({
      _id: applicationId,
      job: jobId,})
      .populate({ path: "candidate",
                 select: "name email",});

    if (!application) return next(new HTTPError(404, "Application not found"));

   
    application.status = status;
    await application.save();

   
    const emailTemplates = {
      Accepted: {
        subject: `🎉 Congratulations! Your application for "${job.title}" has been accepted`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Congratulations ${application.candidate.name}! 🎉</h2>
            <p>We're happy to let you know that your application for 
              <strong>${job.title}</strong> has been <strong>accepted</strong>.
            </p>
            <p>The HR team will be in touch with you soon with next steps.</p>
            <br/>
            <p>Best of luck!</p>
            <p><strong>AI Hiring Platform Team</strong></p>
          </div>
        `,
      },
      Rejected: {
        subject: `Update on your application for "${job.title}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Dear ${application.candidate.name},</h2>
            <p>Thank you for your interest in the <strong>${job.title}</strong> position 
              and for taking the time to apply.
            </p>
            <p>After careful consideration, we regret to inform you that 
              your application was not successful at this time.
            </p>
            <p>We encourage you to keep developing your skills and apply 
              for future positions that match your profile.
            </p>
            <br/>
            <p>We wish you all the best in your job search.</p>
            <p><strong>AI Hiring Platform Team</strong></p>
          </div>
        `,
      },
    };

    if (emailTemplates[status]) {
      try {
        await sendEmail({
          to: application.candidate.email,
          subject: emailTemplates[status].subject,
          html: emailTemplates[status].html,
        });
      } catch (emailErr) {
       
        console.error("Failed to send status email:", emailErr.message);
      }
    }

    return res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      application: {
        _id: application._id,
        status: application.status,
        candidate: application.candidate,
        updatedAt: application.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
// saved jobs by candidate
export const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params; 
    const candidateId = req.user._id; 

   
    const job = await Job.findById(jobId);
    if (!job) return next(new HTTPError(404, "Job not found"));

   
    const existingSave = await SavedJob.findOne({ candidate: candidateId, job: jobId });

    if (existingSave) {
    
      await SavedJob.findByIdAndDelete(existingSave._id);
      return res.status(200).json({
        success: true,
        message: "Job removed from saved jobs successfully",
      });
    }

    const newSave = new SavedJob({ candidate: candidateId, job: jobId });
    await newSave.save();

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getMySavedJobs = async (req, res, next) => {
  try {
    const candidateId = req.user._id;

    const savedJobs = await SavedJob.find({ candidate: candidateId })
    .populate({
      path: "job",
      select: "title status description skills", 
    }).sort("-createdAt"); 

    res.status(200).json({
      success: true,
      results: savedJobs.length,
      data: savedJobs,
    });
  } catch (err) {
    next(err);
  }
};
