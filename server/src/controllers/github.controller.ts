import type { Request, Response } from "express";
import axios from "axios";
import { githubConfig } from "../config/github.js";

export const githubLogin = (_req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: githubConfig.clientId,
    redirect_uri: githubConfig.callbackUrl,
    scope: "read:user user:email repo",
  });

  const githubUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.redirect(githubUrl);
};

export const githubCallback = async (
  req: Request,
  res: Response
) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      res.status(400).json({
        success: false,
        message: "GitHub authorization code is missing",
      });

      return;
    }

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
        redirect_uri: githubConfig.callbackUrl,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      res.status(400).json({
        success: false,
        message: "Failed to get GitHub access token",
      });

      return;
    }

    const userResponse = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    res.status(200).json({
      success: true,
      user: userResponse.data,
      accessToken,
    });
  } catch (error) {
    console.error("GitHub OAuth error:", error);

    res.status(500).json({
      success: false,
      message: "GitHub authentication failed",
    });
  }
};

export const getRepositories = async (
  req: Request,
  res: Response
) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      res.status(401).json({
        success: false,
        message: "GitHub access token is required",
      });

      return;
    }

    const response = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: authorizationHeader,
          Accept: "application/vnd.github+json",
        },
        params: {
          per_page: 100,
          sort: "updated",
          direction: "desc",
        },
      }
    );

    const repositories = response.data.map(
      (repo: {
        id: number;
        name: string;
        full_name: string;
        private: boolean;
        language: string | null;
        html_url: string;
        description: string | null;
        owner: {
          login: string;
        };
      }) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        language: repo.language,
        htmlUrl: repo.html_url,
        description: repo.description,
        owner: repo.owner.login,
      })
    );

    res.status(200).json({
      success: true,
      repositories,
    });
  } catch (error) {
    console.error("GitHub repositories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch GitHub repositories",
    });
  }
};

export const getPullRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      res.status(401).json({
        success: false,
        message: "GitHub access token is required",
      });

      return;
    }

    const { owner, repo } = req.params;

    if (!owner || !repo) {
      res.status(400).json({
        success: false,
        message: "Repository owner and name are required",
      });

      return;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: authorizationHeader,
          Accept: "application/vnd.github+json",
        },
        params: {
          state: "all",
          per_page: 50,
          sort: "updated",
          direction: "desc",
        },
      }
    );

    const pullRequests = response.data.map(
      (pr: {
        id: number;
        number: number;
        title: string;
        state: string;
        user: {
          login: string;
        };
        updated_at: string;
        html_url: string;
      }) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        status: pr.state === "open" ? "open" : "closed",
        author: pr.user.login,
        updatedAt: pr.updated_at,
        htmlUrl: pr.html_url,
      })
    );

    res.status(200).json({
      success: true,
      pullRequests,
    });
  } catch (error) {
    console.error("GitHub pull requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch GitHub pull requests",
    });
  }
};

export const getPullRequestDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      res.status(401).json({
        success: false,
        message: "GitHub access token is required",
      });

      return;
    }

    const { owner, repo, number } = req.params;

    if (!owner || !repo || !number) {
      res.status(400).json({
        success: false,
        message: "Repository owner, name and pull request number are required",
      });

      return;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`,
      {
        headers: {
          Authorization: authorizationHeader,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const pr = response.data;

    const pullRequest = {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      description: pr.body,
      status: pr.state === "open" ? "open" : "closed",
      author: pr.user.login,
      updatedAt: pr.updated_at,
      createdAt: pr.created_at,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      htmlUrl: pr.html_url,
    };

    res.status(200).json({
      success: true,
      pullRequest,
    });
  } catch (error) {
    console.error("GitHub pull request details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch GitHub pull request details",
    });
  }
};