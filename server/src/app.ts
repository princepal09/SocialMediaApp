import express, { Express, Request, Response } from "express";
import cors from "cors";
import testRoutes from "./routes/test.route.js";
import authRoutes from "./routes/auth.route.js";
import commentRoutes from "./routes/comment.route.js";
import likeRoutes from "./routes/like.route.js";
import chatRoutes from "./routes/chat.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import { env } from "./constants.js";
import { rateLimiter } from "./middlewares/rateLimiter.middleware.js";
import cookieParser from "cookie-parser";
export const app = express() as Express;

app.set("trust proxy", 1); // Required behind proxy

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  // Gloval Rate Limitter
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 500,
    prefix: "global",
  })
);

app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "Your Server is running Up....",
  });
});
