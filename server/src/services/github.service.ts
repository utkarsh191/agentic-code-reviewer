// server/src/services/github.service.ts
import axios, { type AxiosRequestConfig } from "axios";
import { parsePatchToDiffLines, type DiffLine } from "./diff.service.js";

const GITHUB_API_URL = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 15_000;

// Isse badi file review ke liye nahi li jayegi (AI token limit aur memory ka bachav).
export const MAX_FILE_BYTES = 500_000;

const JSON_ACCEPT = "application/vnd.github+json";
const RAW_ACCEPT = "application/vnd.github.raw+json";

/* ------------------------------------------------------------------ */
/* Error type                                                          */
/* ------------------------------------------------------------------ */

// Controller ise pakad kar seedha status + message client ko bhej dega.
// Isme kabhi token ya request headers nahi rakhte.
export class GithubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GithubApiError";
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/* Types jo client ko jaate hain (client ke github.service.ts se match) */
/* ------------------------------------------------------------------ */

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  language: string | null;
  htmlUrl: string;
  description: string | null;
  owner: string;
}

export interface PullRequestSummary {
  id: number;
  number: number;
  title: string;
  status: "open" | "closed";
  author: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface PullRequestDetail extends PullRequestSummary {
  description: string | null;
  createdAt: string;
  baseBranch: string;
  headBranch: string;
  headSha: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface ChangedFile {
  filename: string;
  status: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
  patch: string | null;
  diff: DiffLine[];
}

/* ------------------------------------------------------------------ */
/* GitHub API ke raw response shapes (sirf jo fields hum use karte hain) */
/* ------------------------------------------------------------------ */

interface GithubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  language: string | null;
  html_url: string;
  description: string | null;
  owner: { login: string };
}

interface GithubPullSummaryResponse {
  id: number;
  number: number;
  title: string;
  state: string;
  // Deleted GitHub account ka user null aa sakta hai.
  user: { login: string } | null;
  updated_at: string;
  html_url: string;
}

interface GithubPullDetailResponse extends GithubPullSummaryResponse {
  body: string | null;
  created_at: string;
  base: { ref: string };
  head: { ref: string; sha: string };
  additions: number;
  deletions: number;
  changed_files: number;
}

interface GithubFileResponse {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const OWNER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/;
const REPO_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

const assertValidRepo = (owner: string, repo: string): void => {
  if (
    !OWNER_PATTERN.test(owner) ||
    !REPO_PATTERN.test(repo) ||
    repo === "." ||
    repo === ".."
  ) {
    throw new GithubApiError("Invalid repository owner or name", 400);
  }
};

const assertValidPullNumber = (number: number): void => {
  if (!Number.isInteger(number) || number <= 0) {
    throw new GithubApiError("Invalid pull request number", 400);
  }
};

// "src/a b/file.ts" -> "src/a%20b/file.ts" (har segment alag encode, "/" waisa hi rahe).
const encodeFilePath = (path: string): string => {
  const segments = path.split("/");

  if (
    !path ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new GithubApiError("Invalid file path", 400);
  }

  return segments.map((segment) => encodeURIComponent(segment)).join("/");
};

const repoBase = (owner: string, repo: string): string => {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
};

/* ------------------------------------------------------------------ */
/* Internal HTTP helpers                                               */
/* ------------------------------------------------------------------ */

const getHeaders = (accessToken: string, accept: string) => {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };
};

// Axios ke error mein request headers (yaani token) hote hain.
// Isliye poora error kabhi aage nahi bhejte, sirf ye safe GithubApiError.
const toGithubError = (
  error: unknown,
  notFoundMessage: string
): GithubApiError => {
  if (error instanceof GithubApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.message.includes("maxContentLength")) {
      return new GithubApiError("File is too large to review", 413);
    }

    const status = error.response?.status;

    if (status === undefined) {
      return new GithubApiError("Unable to reach GitHub", 502);
    }

    if (status === 401) {
      return new GithubApiError(
        "GitHub token is invalid or expired. Please log in again.",
        401
      );
    }

    if (status === 403 || status === 429) {
      const remaining = String(
        error.response?.headers["x-ratelimit-remaining"]
      );

      if (status === 429 || remaining === "0") {
        return new GithubApiError(
          "GitHub API rate limit reached. Try again later.",
          429
        );
      }

      return new GithubApiError(
        "GitHub denied access to this resource",
        403
      );
    }

    if (status === 404) {
      return new GithubApiError(notFoundMessage, 404);
    }

    return new GithubApiError(`GitHub request failed (status ${status})`, 502);
  }

  return new GithubApiError("Unexpected error while calling GitHub", 500);
};

interface GetOptions {
  params?: Record<string, string | number>;
  // true => file ka raw text (JSON nahi)
  raw?: boolean;
}

const githubGet = async <T>(
  path: string,
  accessToken: string,
  notFoundMessage: string,
  options: GetOptions = {}
): Promise<T> => {
  const config: AxiosRequestConfig = {
    headers: getHeaders(accessToken, options.raw ? RAW_ACCEPT : JSON_ACCEPT),
    params: options.params,
    timeout: REQUEST_TIMEOUT_MS,
  };

  if (options.raw) {
    // Text ko JSON parse na kare (jaise package.json ka content object na ban jaye).
    config.responseType = "text";
    config.transformResponse = [(data) => data];
    config.maxContentLength = MAX_FILE_BYTES;
  }

  try {
    const response = await axios.get<T>(`${GITHUB_API_URL}${path}`, config);
    return response.data;
  } catch (error) {
    throw toGithubError(error, notFoundMessage);
  }
};

const NOT_FOUND_REPO =
  "Repository or pull request not found, or you do not have access to it";

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const getRepositories = async (
  accessToken: string
): Promise<Repository[]> => {
  const data = await githubGet<GithubRepoResponse[]>(
    "/user/repos",
    accessToken,
    "Repositories not found",
    {
      params: { per_page: 100, sort: "updated", direction: "desc" },
    }
  );

  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    language: repo.language,
    htmlUrl: repo.html_url,
    description: repo.description,
    owner: repo.owner.login,
  }));
};

export const getPullRequests = async (
  owner: string,
  repo: string,
  accessToken: string
): Promise<PullRequestSummary[]> => {
  assertValidRepo(owner, repo);

  const data = await githubGet<GithubPullSummaryResponse[]>(
    `${repoBase(owner, repo)}/pulls`,
    accessToken,
    NOT_FOUND_REPO,
    {
      params: {
        state: "all",
        per_page: 50,
        sort: "updated",
        direction: "desc",
      },
    }
  );

  return data.map((pr) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    status: pr.state === "open" ? "open" : "closed",
    author: pr.user?.login ?? "unknown",
    updatedAt: pr.updated_at,
    htmlUrl: pr.html_url,
  }));
};

export const getPullRequestDetails = async (
  owner: string,
  repo: string,
  number: number,
  accessToken: string
): Promise<PullRequestDetail> => {
  assertValidRepo(owner, repo);
  assertValidPullNumber(number);

  const pr = await githubGet<GithubPullDetailResponse>(
    `${repoBase(owner, repo)}/pulls/${number}`,
    accessToken,
    NOT_FOUND_REPO
  );

  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    description: pr.body,
    status: pr.state === "open" ? "open" : "closed",
    author: pr.user?.login ?? "unknown",
    updatedAt: pr.updated_at,
    createdAt: pr.created_at,
    baseBranch: pr.base.ref,
    headBranch: pr.head.ref,
    headSha: pr.head.sha,
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changed_files,
    htmlUrl: pr.html_url,
  };
};

// GitHub ke status ("removed", "renamed", "changed"...) ko client ke 3 status mein badalta hai.
const normalizeFileStatus = (status: string): ChangedFile["status"] => {
  if (status === "added") {
    return "added";
  }

  if (status === "removed") {
    return "deleted";
  }

  return "modified";
};

export const getPullRequestFiles = async (
  owner: string,
  repo: string,
  number: number,
  accessToken: string
): Promise<ChangedFile[]> => {
  assertValidRepo(owner, repo);
  assertValidPullNumber(number);

  const data = await githubGet<GithubFileResponse[]>(
    `${repoBase(owner, repo)}/pulls/${number}/files`,
    accessToken,
    NOT_FOUND_REPO,
    {
      params: { per_page: 100 },
    }
  );

  return data.map((file) => ({
    filename: file.filename,
    status: normalizeFileStatus(file.status),
    additions: file.additions,
    deletions: file.deletions,
    // Binary ya bahut bade diff mein GitHub patch nahi bhejta, tab null.
    patch: file.patch ?? null,
    diff: parsePatchToDiffLines(file.patch),
  }));
};

// Kisi bhi commit (ref = PR ka headSha) par file ka asli content laata hai.
// ESLint aur AI review isi content par chalte hain, patch par nahi.
export const getFileContent = async (
  owner: string,
  repo: string,
  path: string,
  accessToken: string,
  ref: string
): Promise<string> => {
  assertValidRepo(owner, repo);

  if (!ref) {
    throw new GithubApiError("Git ref is required", 400);
  }

  return githubGet<string>(
    `${repoBase(owner, repo)}/contents/${encodeFilePath(path)}`,
    accessToken,
    "File not found at this commit (it may have been deleted)",
    {
      params: { ref },
      raw: true,
    }
  );
};