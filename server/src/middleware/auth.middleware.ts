// server/src/middleware/auth.middleware.ts
import type { NextFunction, Request, Response } from "express";

// "Authorization: Bearer <token>" se token nikalta hai.
// Token asli hai ya nahi, ye GitHub check karta hai. Yahan sirf format check hota hai.
export const requireGithubToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;
  const match = header ? /^Bearer\s+(\S+)$/i.exec(header) : null;
  const token = match?.[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "GitHub access token is required",
    });
    return;
  }

  res.locals.accessToken = token;
  next();
};

// Middleware ke baad controller mein token yahan se lo.
export const getAccessToken = (res: Response): string => {
  return res.locals.accessToken as string;
};