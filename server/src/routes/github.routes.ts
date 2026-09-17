import { Router } from "express";
import {
  githubLogin,
  githubCallback,
  getRepositories,
  getPullRequests,
  getPullRequestDetails,
  getPullRequestFiles,
} from "../controllers/github.controller.js";

const router = Router();

router.get("/login", githubLogin);
router.get("/callback", githubCallback);
router.get("/repositories", getRepositories);
router.get("/pull-requests/:owner/:repo", getPullRequests);
router.get("/pull-requests/:owner/:repo/:number", getPullRequestDetails);
router.get("/pull-requests/:owner/:repo/:number/files", getPullRequestFiles);

export default router;