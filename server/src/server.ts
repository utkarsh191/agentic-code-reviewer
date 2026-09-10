import "dotenv/config";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import reviewRoutes from "./routes/review.routes.js";
import githubRoutes from "./routes/github.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api", reviewRoutes);
app.use("/api/github", githubRoutes);

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});