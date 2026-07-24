import express from "express";
import {
  addBio,
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateBio,
  updateProfileImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = express();

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

//secured routes
router.post("/logout", verifyUser, logoutUser);

//user
router.get("/users/current-user", verifyUser, getCurrentUser);
router.patch("/users/change-password", verifyUser, changeCurrentPassword);
router.post("/users/add-bio", verifyUser, addBio);
router.patch("/users/update-bio", verifyUser, updateBio);
router.patch("/users/update-profile", verifyUser, upload.single("profileImage"), updateProfileImage);

export default router;
