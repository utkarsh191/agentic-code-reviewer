import axios from "axios";

const GITHUB_API_URL = "https://api.github.com";

const getHeaders = (accessToken: string) => {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  };
};

export const getPullRequests = async (
  owner: string,
  repo: string,
  accessToken: string
) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls`,
    {
      headers: getHeaders(accessToken),
      params: {
        state: "all",
        per_page: 100,
        sort: "updated",
        direction: "desc",
      },
    }
  );

  return response.data.map((pr: any) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    author: pr.user.login,
    status: pr.state,
    updatedAt: pr.updated_at,
    description: pr.body,
    htmlUrl: pr.html_url,
  }));
};

export const getPullRequest = async (
  owner: string,
  repo: string,
  number: number,
  accessToken: string
) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${number}`,
    {
      headers: getHeaders(accessToken),
    }
  );

  const pr = response.data;

  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    author: pr.user.login,
    status: pr.state,
    updatedAt: pr.updated_at,
    createdAt: pr.created_at,
    description: pr.body,
    body: pr.body,
    htmlUrl: pr.html_url,
  };
};

export const getPullRequestFiles = async (
  owner: string,
  repo: string,
  number: number,
  accessToken: string
) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${number}/files`,
    {
      headers: getHeaders(accessToken),
      params: {
        per_page: 100,
      },
    }
  );

  return response.data.map((file: any) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch ?? null,
  }));
};

export const getFileContent = async (
  owner: string,
  repo: string,
  path: string,
  accessToken: string,
  ref: string
) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: getHeaders(accessToken),
      params: {
        ref,
      },
    }
  );

  if (!response.data.content) {
    throw new Error(`File content not available: ${path}`);
  }

  return Buffer.from(
    response.data.content,
    "base64"
  ).toString("utf-8");
};