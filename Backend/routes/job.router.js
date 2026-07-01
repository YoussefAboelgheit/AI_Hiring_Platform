import { Router } from "express";
import {
  applyToJob,
  analyzeJobApplicationForHr,
  analyzeTopJobCandidates,
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  getJobApplicationsForHr,
  getJobsByCategory,
  getMyJobsWithApplications,
  getMyApplicationById,
  getMyAppliedJobs,
  getJobEnrichment,
  retryMyApplicationMatch,
  updateJob,
  adminUpdateJobStatus,   // admin
  adminDeleteJob, // admin
} from "../controllers/job.controller.js";
import authMW from "../middlewares/authMW.js";
import { authorize } from "../middlewares/authorizeMW.js";
import jobOwnershipMW from "../middlewares/jobOwnershipMW.js";
import { uploadCV } from "../middlewares/uploadMW.js";
import {
  idParamValidator,
  jobApplicationParamsValidator,
} from "../validations/paramValidators.js";
import {
  applyToJobValidator,
  categoryNameParamValidator,
  createJobValidator,
  updateJobValidator,
  updateJobStatusValidator,   //admin
} from "../validations/jobValidators.js";
import validateResults from "../validations/validateResults.js";

const router = Router();

// admin 
router.patch(
  "/admin/:id/status",
  authMW,
  authorize("admin"),
  idParamValidator,
  updateJobStatusValidator,
  validateResults,
  adminUpdateJobStatus
);

router.delete(
  "/admin/:id",
  authMW,
  authorize("admin"),
  idParamValidator,
  validateResults,
  adminDeleteJob
);
//////////

//hr

router.get("/", getAllJobs);
router.get("/category/:category", categoryNameParamValidator, validateResults, getJobsByCategory);
router.get("/applied/me", authMW, authorize("candidate"), getMyAppliedJobs);
router.get(
  "/hr/my-jobs/applications",
  authMW,
  authorize("hr"),
  getMyJobsWithApplications
);
router.get(
  "/applications/:id",
  authMW,
  authorize("candidate"),
  idParamValidator,
  validateResults,
  getMyApplicationById
);
router.post(
  "/applications/:id/retry",
  authMW,
  authorize("candidate"),
  uploadCV,
  idParamValidator,
  validateResults,
  retryMyApplicationMatch
);
router.get(
  "/:jobId/applications/:applicationId/analysis",
  authMW,
  authorize("hr", "admin"),
  jobApplicationParamsValidator,
  validateResults,
  analyzeJobApplicationForHr
);
router.get(
  "/:id/applications",
  authMW,
  authorize("hr"),
  idParamValidator,
  validateResults,
  getJobApplicationsForHr
);
router.get(
  "/:id/applications/top-analysis",
  authMW,
  authorize("hr", "admin"),
  idParamValidator,
  validateResults,
  analyzeTopJobCandidates
);
router.post(
  "/:id/apply",
  authMW,
  authorize("candidate"),
  uploadCV,
  idParamValidator,
  applyToJobValidator,
  validateResults,
  applyToJob
);
router.get("/:id/enrichment", idParamValidator, validateResults, getJobEnrichment);
router.get("/:id", idParamValidator, validateResults, getJobById);

router.post("/", authMW, authorize("hr"), createJobValidator, validateResults, createJob);
router.patch(
  "/:id",
  authMW,
  authorize("hr"),
  idParamValidator,
  updateJobValidator,
  validateResults,
  jobOwnershipMW,
  updateJob
);
router.delete(
  "/:id",
  authMW,
  authorize("hr", "admin"),
  idParamValidator,
  validateResults,
  jobOwnershipMW,
  deleteJob
);

export default router;
