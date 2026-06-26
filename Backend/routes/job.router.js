import { Router } from "express";
import {
  applyToJob,
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  getJobsByCategory,
  getMyApplicationById,
  getMyAppliedJobs,
  updateJob,
} from "../controllers/job.controller.js";
import authMW from "../middlewares/authMW.js";
import { authorize } from "../middlewares/authorizeMW.js";
import jobOwnershipMW from "../middlewares/jobOwnershipMW.js";
import { uploadCV } from "../middlewares/uploadMW.js";
import { idParamValidator } from "../validations/paramValidators.js";
import {
  applyToJobValidator,
  categoryNameParamValidator,
  createJobValidator,
  updateJobValidator,
} from "../validations/jobValidators.js";
import validateResults from "../validations/validateResults.js";

const router = Router();

router.get("/", getAllJobs);
router.get("/category/:category", categoryNameParamValidator, validateResults, getJobsByCategory);
router.get("/applied/me", authMW, authorize("candidate"), getMyAppliedJobs);
router.get(
  "/applications/:id",
  authMW,
  authorize("candidate"),
  idParamValidator,
  validateResults,
  getMyApplicationById
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
  authorize("hr"),
  idParamValidator,
  validateResults,
  jobOwnershipMW,
  deleteJob
);

export default router;
