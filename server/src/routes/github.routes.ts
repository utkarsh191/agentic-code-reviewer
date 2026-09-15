import { Router } from "express";
import {
  githubLogin,
  githubCallback,
  getRepositories,
} from "../controllers/github.controller.js";

const router = Router();

router.get("/login", githubLogin);
router.get("/callback", githubCallback);
router.get("/repositories", getRepositories);

export default router;