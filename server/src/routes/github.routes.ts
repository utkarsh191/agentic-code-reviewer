import { Router } from "express";
import {
  githubLogin,
  githubCallback,
} from "../controllers/github.controller.js";

const router = Router();

router.get("/login", githubLogin);
router.get("/callback", githubCallback);

export default router;