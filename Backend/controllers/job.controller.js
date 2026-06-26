import Category from "../models/category.js";
import Job from "../models/job.js";
import JobApplication from "../models/jobApplication.js";
import APIFeatures from "../util/apiFeatures.js";
import HTTPError from "../util/httpError.js";
import { uploadToSupabase } from "../util/supabaseClient.js";

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
  "status",
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

export const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      ...pickJobFields(req.body),
      recruiter: req.user._id,
    });

    const populatedJob = await Job.findById(job._id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    return res.status(201).json({
      message: "Job created successfully",
      job: populatedJob,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    const features = new APIFeatures(Job.find(), req.query)
      .filter()
      .search(["title", "description", "requirements", "location", "skills"])
      .sort()
      .paginate()
      .limitFields()
      .populate([recruiterPopulate, categoryPopulate]);

    const jobs = await features.query;

    return res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    if (!job) return next(new HTTPError(404, "Job not found"));

    return res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
};

export const getJobsByCategory = async (req, res, next) => {
  try {
    const categoryName = req.params.category;
    const categoryRegex = new RegExp(`^${escapeRegExp(categoryName)}$`, "i");
    const categories = await Category.find({ name: categoryRegex }).select("_id");

    if (categories.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    const jobs = await Job.find({ category: { $in: categories.map((category) => category._id) } })
      .populate(recruiterPopulate)
      .populate(categoryPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({ jobs });
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

    return res.status(200).json({ applications });
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
      .populate({ path: "candidate", select: "name email role profile_image CV" });

    if (!application) return next(new HTTPError(404, "Application not found"));

    return res.status(200).json({ application });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    Object.assign(req.job, pickJobFields(req.body));
    await req.job.save();

    const job = await Job.findById(req.job._id)
      .populate(recruiterPopulate)
      .populate(categoryPopulate);

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    await req.job.deleteOne();

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const applyToJob = async (req, res, next) => {
  try {
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
      return next(new HTTPError(409, "You have already applied to this job"));
    }

    const uploadedCV = req.files?.CV?.[0];
    const cvUrl = uploadedCV
      ? await uploadToSupabase(uploadedCV.buffer, uploadedCV.mimetype, "applications/cvs")
      : req.user.CV;

    const application = await JobApplication.create({
      job: job._id,
      candidate: req.user._id,
      CV: cvUrl,
    });

    const populatedApplication = await JobApplication.findById(application._id)
      .populate({ path: "job", select: "title status workplace jobType location applicationEnd" })
      .populate({ path: "candidate", select: "name email role profile_image CV" });

    return res.status(201).json({
      message: "Application submitted successfully",
      application: populatedApplication,
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
      job: populatedJob,
    });
  } catch (err) {
    next(err);
  }
};
//delet any job by admin
export const adminDeleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new HTTPError(404, "Job not found"));

    await job.deleteOne();

    return res.status(200).json({ message: "Job deleted successfully by admin" });
  } catch (err) {
    next(err);
  }
};
