import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { MulterError } from "multer";
import { redisClient } from "./config/redis.js";
import { ApiError } from "./utils/ApiError.js";
import authRoutes from "./routes/auth.route.js";
import commentRoutes from "./routes/comment.route.js";
import likeRoutes from "./routes/like.route.js";
import chatRoutes from "./routes/chat.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import { env } from "./constants.js";
import { rateLimiter } from "./middlewares/rateLimiter.middleware.js";
import cookieParser from "cookie-parser";
export const app = express();

app.disable("x-powered-by");
if (env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Pixora API" });
});

app.get("/healthz", (_req, res) => {
  const ready = mongoose.connection.readyState === 1 && redisClient.isReady;
  res.set("Cache-Control", "no-store").status(ready ? 200 : 503).json({
    status: ready ? "ok" : "unavailable",
  });
});

app.use("/api/v1", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  const origin = req.get("Origin");
  if (origin && !env.CORS_ORIGINS.includes(origin)) {
    return res.status(403).json({ success: false, message: "Origin is not allowed." });
  }
  next();
});

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 500,
    prefix: "global",
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/chat", chatRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

const handleError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      success: false,
      message: tooLarge ? "The selected file exceeds the upload limit." : "Invalid upload.",
    });
  }
  if (error instanceof ApiError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  if (error.status === 400 || error.status === 413) {
    return res.status(error.status).json({ success: false, message: "Invalid request body." });
  }
  console.error("Unhandled API error:", error);
  res.status(500).json({ success: false, message: "Internal server error." });
};

app.use(handleError);
