// client/src/services/github.service.ts
import { API_URL, clearAuth, getAccessToken } from "./auth";

const GITHUB_API_URL = `${API_URL}/api/github`;
const REVIEW_API_URL = `${API_URL}/api/review`;

/* ------------------------------------------------------------------ */
/* Types (backend ke response se match karte hain)                     */
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

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  updatedAt: string; // ISO date, jaise "2026-09-20T10:15:00Z"
  htmlUrl: string;
}

export interface PullRequestDetails extends PullRequest {
  description: string | null;
  createdAt: string;
  baseBranch: string;
  headBranch: string;
  headSha: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
}

export interface ChangedFile {
  filename: string;
  status: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
  patch: string | null;
  diff: DiffLine[];
}

export interface ESLintFinding {
  ruleId: string;
  severity: "error" | "warning";
  message: string;
  filePath: string;
  line: number;
  column: number;
}

export interface Finding {
  category: "bug" | "security" | "performance" | "quality";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  suggestedFix: string;
  // Aage chalkar server file/line bhej sakta hai (dedupe ke liye), isliye optional.
  file?: string;
  line?: number;
}

export interface ReviewResult {
  summary: string;
  findings: Finding[];
}

export interface PullRequestFileReview {
  review: ReviewResult;
  eslintFindings: ESLintFinding[];
}

/* ------------------------------------------------------------------ */
/* Error type                                                          */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                    */
/* ------------------------------------------------------------------ */

interface ApiResponseBody {
  success: boolean;
  message?: string;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
}

const handleSessionExpired = (): void => {
  clearAuth();
  window.location.assign("/login");
};

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const request = async <T extends ApiResponseBody>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    handleSessionExpired();
    throw new ApiError("You are not logged in.", 401);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new ApiError("Unable to connect to the server.", 0);
  }

  const data = await parseJson<T>(response);

  if (response.status === 401) {
    handleSessionExpired();
    throw new ApiError(
      data?.message || "Session expired. Please log in again.",
      401
    );
  }

  if (!response.ok || !data || !data.success) {
    throw new ApiError(
      data?.message || `Request failed with status ${response.status}.`,
      response.status
    );
  }

  return data;
};

// owner/repo mein special characters ho to URL na toote.
const repoPath = (owner: string, repo: string): string => {
  return `${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
};

/* ------------------------------------------------------------------ */
/* Response shapes                                                     */
/* ------------------------------------------------------------------ */

interface RepositoriesResponse extends ApiResponseBody {
  repositories?: Repository[];
}

interface PullRequestsResponse extends ApiResponseBody {
  pullRequests?: PullRequest[];
}

interface PullRequestDetailsResponse extends ApiResponseBody {
  pullRequest?: PullRequestDetails;
}

interface ChangedFilesResponse extends ApiResponseBody {
  files?: ChangedFile[];
}

interface ESLintResponse extends ApiResponseBody {
  findings?: ESLintFinding[];
}

interface ReviewResponse extends ApiResponseBody {
  review?: ReviewResult;
  eslintFindings?: ESLintFinding[];
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const getRepositories = async (): Promise<Repository[]> => {
  const data = await request<RepositoriesResponse>(
    `${GITHUB_API_URL}/repositories`
  );

  return data.repositories ?? [];
};

export const getPullRequests = async (
  owner: string,
  repo: string
): Promise<PullRequest[]> => {
  const data = await request<PullRequestsResponse>(
    `${GITHUB_API_URL}/pull-requests/${repoPath(owner, repo)}`
  );

  return data.pullRequests ?? [];
};

export const getPullRequestDetails = async (
  owner: string,
  repo: string,
  number: number
): Promise<PullRequestDetails> => {
  const data = await request<PullRequestDetailsResponse>(
    `${GITHUB_API_URL}/pull-requests/${repoPath(owner, repo)}/${number}`
  );

  if (!data.pullRequest) {
    throw new ApiError("Pull request details missing in response.", 500);
  }

  return data.pullRequest;
};

export const getPullRequestFiles = async (
  owner: string,
  repo: string,
  number: number
): Promise<ChangedFile[]> => {
  const data = await request<ChangedFilesResponse>(
    `${GITHUB_API_URL}/pull-requests/${repoPath(owner, repo)}/${number}/files`
  );

  return data.files ?? [];
};

// Server ye file GitHub se actual content ke saath fetch karke ESLint chalayega.
export const getFileESLintFindings = async (
  owner: string,
  repo: string,
  number: number,
  filename: string
): Promise<ESLintFinding[]> => {
  const data = await request<ESLintResponse>(
    `${GITHUB_API_URL}/pull-requests/${repoPath(owner, repo)}/${number}/eslint?filename=${encodeURIComponent(filename)}`
  );

  return data.findings ?? [];
};

// Server: file content fetch -> ESLint -> AI review -> dono ke results wapas.
export const reviewPullRequestFile = async (
  owner: string,
  repo: string,
  number: number,
  filename: string
): Promise<PullRequestFileReview> => {
  const data = await request<ReviewResponse>(
    `${REVIEW_API_URL}/pull-request`,
    {
      method: "POST",
      body: { owner, repo, number, filename },
    }
  );

  if (!data.review) {
    throw new ApiError("Review missing in response.", 500);
  }

  return {
    review: data.review,
    eslintFindings: data.eslintFindings ?? [],
  };
};