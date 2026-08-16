import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByPostId,
} from "../controllers/comment.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

const commentLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  prefix: "comment",
  perUser: true,
});

router.post(
  "/create-comment/:postId",
  verifyUser,
  commentLimiter,
  createComment
);
router.get("/get-comments/:postId", verifyUser, getCommentsByPostId);
router.delete(
  "/delete-comment/post/:postId/comment/:commentId",
  verifyUser,
  deleteComment
);

export default router;
