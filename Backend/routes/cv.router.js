import { Router } from "express";
import { parseCv } from "../controllers/cvParser.controller.js";
import { uploadCV } from "../middlewares/uploadMW.js";
import { parseCvValidator } from "../validations/cvParserValidators.js";
import validateResults from "../validations/validateResults.js";

const router = Router();

router.post("/parse", uploadCV, parseCvValidator, validateResults, parseCv);

export default router;
