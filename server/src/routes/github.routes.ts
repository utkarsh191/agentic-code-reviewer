// server/src/routes/github.routes.ts
import { Router } from "express";
import { requireGithubToken } from "../middleware/auth.middleware.js";
import {
  githubLogin,
  githubCallback,
  getRepositories,
  getPullRequests,
  getPullRequestDetails,
  getPullRequestFiles,
} from "../controllers/github.controller.js";
import { getFileESLint } from "../controllers/review.controller.js";

const router = Router();

// OAuth: token yahan nahi hota, isliye middleware nahi lagta.
router.get("/login", githubLogin);
router.get("/callback", githubCallback);

// GitHub data: Authorization: Bearer <token> zaroori hai.
router.get("/repositories", requireGithubToken, getRepositories);
router.get("/pull-requests/:owner/:repo", requireGithubToken, getPullRequests);
router.get(
  "/pull-requests/:owner/:repo/:number",
  requireGithubToken,
  getPullRequestDetails
);
router.get(
  "/pull-requests/:owner/:repo/:number/files",
  requireGithubToken,
  getPullRequestFiles
);
router.get(
  "/pull-requests/:owner/:repo/:number/eslint",
  requireGithubToken,
  getFileESLint
);

export default router;