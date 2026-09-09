import "dotenv/config";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { reviewCode } from "./services/ai.service.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.post("/api/review", async (req, res) => {
  try {
    const { code } = req.body;

    const review = await reviewCode(code);

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI review failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});