// server/src/server.ts
import "dotenv/config";

import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { githubConfig } from "./config/github.js";
import reviewRoutes from "./routes/review.routes.js";
import githubRoutes from "./routes/github.routes.js";

const app = express();

// Sirf apna frontend allow hai. Baaki websites browser se is API ko call nahi kar sakti.
app.use(
  cors({
    origin: githubConfig.clientUrl,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api", reviewRoutes);
app.use("/api/github", githubRoutes);

// Koi route match nahi hua to HTML ki jagah JSON 404.
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler. Express ke liye 4 parameters zaroori hain (err, req, res, next).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number"
      ? err.status
      : 500;

  // Sirf message log karte hain, poora error object nahi (usme headers/tokens ho sakte hain).
  console.error(
    "Unhandled error:",
    err instanceof Error ? err.message : err
  );

  if (status === 413) {
    res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
    return;
  }

  if (status >= 400 && status < 500) {
    res.status(status).json({
      success: false,
      message: "Invalid request",
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// MongoDB abhi kisi feature mein use nahi ho raha, to ye server ko rokta nahi.
// connectDB() kabhi throw nahi karta, isliye void theek hai.
void connectDB();