import { Router } from "express";
import { generateEmbeddings } from "../controllers/embeddings.controller.js";

const router = Router();

// POST /api/embeddings/generate
router.post("/generate", generateEmbeddings);

export default router;
