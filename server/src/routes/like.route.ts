import express from "express";
import {
  getUsersWhoLikedPost,
  togglePostLike,
} from "../controllers/like.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express();

const likeLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  prefix: "like",
  perUser: true,
});

router.post("/like-unlike/:postId", verifyUser, likeLimiter, togglePostLike);
router.get("/get-user/:postId", verifyUser, getUsersWhoLikedPost);

export default router;
