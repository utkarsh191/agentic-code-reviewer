// server/src/controllers/github.controller.ts
import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import axios from "axios";
import { githubConfig } from "../config/github.js";
import { getAccessToken } from "../middleware/auth.middleware.js";
import * as githubService from "../services/github.service.js";

const REQUEST_TIMEOUT_MS = 15_000;

/* ------------------------------------------------------------------ */
/* OAuth state (CSRF protection)                                       */
/* ------------------------------------------------------------------ */

const STATE_COOKIE = "oauth_state";
const STATE_COOKIE_PATH = "/api/github";
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

const stateCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: STATE_COOKIE_PATH,
};

// cookie-parser install kiye bina ek cookie padhne ka chhota helper.
const readCookie = (req: Request, name: string): string | undefined => {
  const header = req.headers.cookie;

  if (!header) {
    return undefined;
  }

  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");

    if (rawName === name) {
      return rest.join("=");
    }
  }

  return undefined;
};

const isSameState = (actual: string, expected: string): boolean => {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
};

// Frontend ke AuthCallback page par error bhejta hai (#error=...).
const redirectWithError = (res: Response, message: string): void => {
  const params = new URLSearchParams({ error: message });

  res.redirect(`${githubConfig.clientUrl}/auth/callback#${params.toString()}`);
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const param = (value: unknown): string | undefined => {
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

// GithubApiError ka status aur safe message seedha client ko jata hai.
// Baaki errors ka sirf message log hota hai (poore error mein token ho sakta hai).
const sendError = (res: Response, error: unknown, fallback: string): void => {
  if (error instanceof githubService.GithubApiError) {
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
/* OAuth                                                               */
/* ------------------------------------------------------------------ */

interface GithubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GithubUserResponse {
  login: string;
  avatar_url: string | null;
}

export const githubLogin = (_req: Request, res: Response) => {
  const state = randomBytes(16).toString("hex");

  res.cookie(STATE_COOKIE, state, {
    ...stateCookieOptions,
    maxAge: STATE_MAX_AGE_MS,
  });

  const params = new URLSearchParams({
    client_id: githubConfig.clientId,
    redirect_uri: githubConfig.callbackUrl,
    scope: "read:user user:email repo",
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

export const githubCallback = async (req: Request, res: Response) => {
  const code = param(req.query.code);
  const state = param(req.query.state);
  const expectedState = readCookie(req, STATE_COOKIE);

  // State cookie ek hi baar kaam aati hai, isliye turant hata dete hain.
  res.clearCookie(STATE_COOKIE, stateCookieOptions);

  // User ne GitHub par "Cancel" dabaya.
  if (req.query.error) {
    redirectWithError(res, "GitHub login was cancelled or denied.");
    return;
  }

  if (!state || !expectedState || !isSameState(state, expectedState)) {
    redirectWithError(
      res,
      "Login session is invalid or expired. Please try again."
    );
    return;
  }

  if (!code) {
    redirectWithError(res, "GitHub authorization code is missing.");
    return;
  }

  try {
    const tokenResponse = await axios.post<GithubTokenResponse>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
        redirect_uri: githubConfig.callbackUrl,
      },
      {
        headers: { Accept: "application/json" },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      redirectWithError(
        res,
        "GitHub did not return an access token. Please try again."
      );
      return;
    }

    const userResponse = await axios.get<GithubUserResponse>(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    const params = new URLSearchParams({
      access_token: accessToken,
      login: userResponse.data.login,
    });

    if (userResponse.data.avatar_url) {
      params.set("avatar_url", userResponse.data.avatar_url);
    }

    // Token URL fragment (#) mein jata hai, query string (?) mein nahi.
    // Fragment browser ke bahar kabhi nahi jata (na server logs mein, na Referer mein).
    res.setHeader("Cache-Control", "no-store");
    res.redirect(`${githubConfig.clientUrl}/auth/callback#${params.toString()}`);
  } catch (error) {
    // Sirf message log karte hain. Poore axios error mein client_secret/token aa sakta hai.
    console.error(
      "GitHub OAuth error:",
      error instanceof Error ? error.message : error
    );

    redirectWithError(res, "GitHub authentication failed. Please try again.");
  }
};

/* ------------------------------------------------------------------ */
/* GitHub data (routes par requireGithubToken middleware lagega)        */
/* ------------------------------------------------------------------ */

export const getRepositories = async (_req: Request, res: Response) => {
  try {
    const repositories = await githubService.getRepositories(
      getAccessToken(res)
    );

    res.status(200).json({
      success: true,
      repositories,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch GitHub repositories");
  }
};

export const getPullRequests = async (req: Request, res: Response) => {
  const owner = param(req.params.owner);
  const repo = param(req.params.repo);

  if (!owner || !repo) {
    res.status(400).json({
      success: false,
      message: "Repository owner and name are required",
    });
    return;
  }

  try {
    const pullRequests = await githubService.getPullRequests(
      owner,
      repo,
      getAccessToken(res)
    );

    res.status(200).json({
      success: true,
      pullRequests,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch GitHub pull requests");
  }
};

export const getPullRequestDetails = async (req: Request, res: Response) => {
  const owner = param(req.params.owner);
  const repo = param(req.params.repo);
  const number = param(req.params.number);

  if (!owner || !repo || !number) {
    res.status(400).json({
      success: false,
      message: "Repository owner, name and pull request number are required",
    });
    return;
  }

  try {
    const pullRequest = await githubService.getPullRequestDetails(
      owner,
      repo,
      Number(number),
      getAccessToken(res)
    );

    res.status(200).json({
      success: true,
      pullRequest,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch GitHub pull request details");
  }
};

export const getPullRequestFiles = async (req: Request, res: Response) => {
  const owner = param(req.params.owner);
  const repo = param(req.params.repo);
  const number = param(req.params.number);

  if (!owner || !repo || !number) {
    res.status(400).json({
      success: false,
      message: "Repository owner, name and pull request number are required",
    });
    return;
  }

  try {
    const files = await githubService.getPullRequestFiles(
      owner,
      repo,
      Number(number),
      getAccessToken(res)
    );

    res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch GitHub pull request files");
  }
};