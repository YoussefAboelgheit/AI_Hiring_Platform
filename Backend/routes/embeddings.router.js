import { Router } from "express";
import {
  generateEmbeddings,
  generateJobEmbeddings,
} from "../controllers/embeddings.controller.js";

const router = Router();

// POST /api/embeddings/generate
router.post("/generate", generateEmbeddings);
router.post("/generate-job", generateJobEmbeddings);

export default router;
