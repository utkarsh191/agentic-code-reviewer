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