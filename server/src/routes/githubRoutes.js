import { Router } from "express";
import { getRepoDashboard } from "../controllers/githubController.js";
import { getBenchmarkData } from "../controllers/benchmarkController.js";
import { getHealthStructure, getAIDiagnostic } from "../controllers/healthController.js";
import { getContributorIntelligence, getContributorPortfolio } from "../controllers/contributorController.js";
import { getAiRepoSummary } from "../controllers/summaryController.js";

const router = Router();

// GET /api/github/dashboard
router.get("/dashboard", getRepoDashboard);

// GET /api/github/benchmark
router.get("/benchmark", getBenchmarkData);

// GET /api/github/health/structure
router.get("/health/structure", getHealthStructure);

// POST /api/github/health/ai-chat
router.post("/health/ai-chat", getAIDiagnostic);

// GET /api/github/contributors/intelligence
router.get("/contributors/intelligence", getContributorIntelligence);

// GET /api/github/contributors/portfolio/:username
router.get("/contributors/portfolio/:username", getContributorPortfolio);

// GET /api/github/ai-summary
router.get("/ai-summary", getAiRepoSummary);

export default router;

