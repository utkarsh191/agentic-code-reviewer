const API_BASE_URL = "http://localhost:5000/api/github";

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  updatedAt: string;
  description: string | null;
  htmlUrl: string;
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

export interface PullRequestDetails extends PullRequest {
  body: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PullRequestsResponse {
  success: boolean;
  pullRequests?: PullRequest[];
  message?: string;
}

interface PullRequestDetailsResponse {
  success: boolean;
  pullRequest?: PullRequestDetails;
  message?: string;
}

interface ChangedFilesResponse {
  success: boolean;
  files?: ChangedFile[];
  message?: string;
}

const getAuthHeaders = (accessToken: string) => {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

export const getPullRequests = async (
  owner: string,
  repo: string,
  accessToken: string
): Promise<PullRequest[]> => {
  const response = await fetch(
    `${API_BASE_URL}/pull-requests/${owner}/${repo}`,
    {
      method: "GET",
      headers: getAuthHeaders(accessToken),
    }
  );

  const data: PullRequestsResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Failed to fetch pull requests."
    );
  }

  return data.pullRequests ?? [];
};

export const getPullRequestDetails = async (
  owner: string,
  repo: string,
  number: number,
  accessToken: string
): Promise<PullRequestDetails> => {
  const response = await fetch(
    `${API_BASE_URL}/pull-requests/${owner}/${repo}/${number}`,
    {
      method: "GET",
      headers: getAuthHeaders(accessToken),
    }
  );

  const data: PullRequestDetailsResponse =
    await response.json();

  if (!response.ok || !data.success || !data.pullRequest) {
    throw new Error(
      data.message || "Failed to fetch pull request details."
    );
  }

  return data.pullRequest;
};

export const getPullRequestFiles = async (
  owner: string,
  repo: string,
  number: number,
  accessToken: string
): Promise<ChangedFile[]> => {
  const response = await fetch(
    `${API_BASE_URL}/pull-requests/${owner}/${repo}/${number}/files`,
    {
      method: "GET",
      headers: getAuthHeaders(accessToken),
    }
  );

  const data: ChangedFilesResponse =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Failed to fetch pull request files."
    );
  }

  return data.files ?? [];
};