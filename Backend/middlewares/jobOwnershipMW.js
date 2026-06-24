import Job from "../models/job.js";
import HTTPError from "../util/httpError.js";

export default async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new HTTPError(404, "Job not found"));

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return next(new HTTPError(403, "You can only modify jobs you created"));
    }

    req.job = job;
    next();
  } catch (err) {
    next(err);
  }
};
