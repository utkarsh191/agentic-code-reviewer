// server/src/controllers/review.controller.ts
import type { Request, Response } from "express";
import { AiReviewError, reviewCode } from "../services/ai.service.js";
import { GithubApiError } from "../services/github.service.js";
import { getAccessToken } from "../middleware/auth.middleware.js";
import {
  reviewPullRequestFile,
  runESLintForPullRequestFile,
} from "../services/review.service.js";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

// Sirf non-empty string chalti hai (params, query aur body ke liye).
const param = (value: unknown): string | undefined => {
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

// 25 ya "25" dono chalte hain. Baaki sab undefined.
const toPositiveInt = (value: unknown): number | undefined => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : Number.NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

// GithubApiError / AiReviewError ka status aur safe message seedha client ko jata hai.
// Baaki errors ka sirf message log hota hai (poore error mein token/headers ho sakte hain).
const sendError = (res: Response, error: unknown, fallback: string): void => {
  if (error instanceof GithubApiError || error instanceof AiReviewError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error(fallback, error instanceof Error ? error.message : error);

  res.status(500).json({
    success: false,
    message: fallback,
  });
};

/* ------------------------------------------------------------------ */
/* POST /api/review  (paste kiya hua code, CodeReview page)            */
/* ------------------------------------------------------------------ */

export const review = async (req: Request, res: Response) => {
  const body: unknown = req.body;
  const code = isRecord(body) ? body.code : undefined;

  if (typeof code !== "string" || code.trim() === "") {
    res.status(400).json({
      success: false,
      message: "Code is required",
    });
    return;
  }

  try {
    const result = await reviewCode(code);

    res.status(200).json({
      success: true,
      review: result,
    });
  } catch (error) {
    sendError(res, error, "AI review failed");
  }
};

/* ------------------------------------------------------------------ */
/* POST /api/review/pull-request  (PR ki ek file ka poora review)      */
/* ------------------------------------------------------------------ */

export const reviewPullRequest = async (req: Request, res: Response) => {
  const body: unknown = req.body;
  const data: Record<string, unknown> = isRecord(body) ? body : {};

  const owner = param(data.owner);
  const repo = param(data.repo);
  const filename = param(data.filename);
  const number = toPositiveInt(data.number);

  if (!owner || !repo || !filename || number === undefined) {
    res.status(400).json({
      success: false,
      message: "owner, repo, number and filename are required",
    });
    return;
  }

  try {
    const result = await reviewPullRequestFile(
      owner,
      repo,
      number,
      filename,
      getAccessToken(res)
    );

    res.status(200).json({
      success: true,
      review: result.review,
      eslintFindings: result.eslintFindings,
    });
  } catch (error) {
    sendError(res, error, "Pull request review failed");
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/github/pull-requests/:owner/:repo/:number/eslint?filename= */
/* ------------------------------------------------------------------ */

export const getFileESLint = async (req: Request, res: Response) => {
  const owner = param(req.params.owner);
  const repo = param(req.params.repo);
  const number = toPositiveInt(req.params.number);
  const filename = param(req.query.filename);

  if (!owner || !repo || number === undefined || !filename) {
    res.status(400).json({
      success: false,
      message: "owner, repo, number and filename are required",
    });
    return;
  }

  try {
    const findings = await runESLintForPullRequestFile(
      owner,
      repo,
      number,
      filename,
      getAccessToken(res)
    );

    res.status(200).json({
      success: true,
      findings,
    });
  } catch (error) {
    sendError(res, error, "ESLint check failed");
  }
};