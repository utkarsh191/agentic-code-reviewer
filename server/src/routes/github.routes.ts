import { Router } from "express";
import {
  githubLogin,
  githubCallback,
  getRepositories,
  getPullRequests,
} from "../controllers/github.controller.js";

const router = Router();

router.get("/login", githubLogin);
router.get("/callback", githubCallback);
router.get("/repositories", getRepositories);
router.get("/pull-requests/:owner/:repo", getPullRequests);

export default router;