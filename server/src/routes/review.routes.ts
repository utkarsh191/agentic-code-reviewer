// server/src/routes/review.routes.ts
import { Router } from "express";
import { requireGithubToken } from "../middleware/auth.middleware.js";
import {
  review,
  reviewPullRequest,
} from "../controllers/review.controller.js";

const router = Router();

// Paste kiya hua code (CodeReview page)
router.post("/review", requireGithubToken, review);

// PR ki ek file: content fetch, ESLint aur AI review (PullRequestDetails page)
router.post("/review/pull-request", requireGithubToken, reviewPullRequest);

export default router;