import express, { Express, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import testRoutes from "../src/routes/test.route.js";
import authRoutes from "../src/routes/auth.route.js";
import commentRoutes from "../src/routes/comment.route.js";
import likeRoutes from "../src/routes/like.route.js";
import userRoutes from "../src/routes/user.route.js";
import { env } from "./constants.js";
import postRoutes from "../src/routes/post.route.js";
export const app = express() as Express;

app.use(
  cors({
    origin: [env.CORS_ORIGIN],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comments", commentRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "Your Server is running Up....",
  });
});
