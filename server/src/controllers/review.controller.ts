import type { Request, Response } from "express";
import { reviewCode } from "../services/ai.service.js";

export const review = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      res.status(400).json({
        success: false,
        message: "Code is required",
      });
      return;
    }

    const result = await reviewCode(code);

    res.status(200).json({
      success: true,
      review: result,
    });
  } catch (error) {
    console.error("Code review error:", error);

    res.status(500).json({
      success: false,
      message: "AI review failed",
    });
  }
};