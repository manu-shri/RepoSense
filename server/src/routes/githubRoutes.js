import { Router } from "express";
import { getRepoDashboard } from "../controllers/githubController.js";

const router = Router();

// GET /api/github/dashboard?owner=public-apis&repo=public-apis
router.get("/dashboard", getRepoDashboard);

export default router;

