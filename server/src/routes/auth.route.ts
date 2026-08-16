import express from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";
const router = express.Router();

const loginLimiter = rateLimiter({
  windowMs: 3000,
  max: 2,
  prefix: "login",
});

const refreshLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  prefix: "refresh",
});

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/refresh-token", refreshLimiter, refreshAccessToken);

//secured routes
router.post("/logout", verifyUser, logoutUser);

export default router;
