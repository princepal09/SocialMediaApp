import express from "express";
import {
  addBio,
  changeCurrentPassword,
  followUser,
  getCurrentUser,
  getUserFollowers,
  getUserProfileData,
  unfollowUser,
  updateBio,
  updateProfileImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = express();

//user
router.get("/current-user", verifyUser, getCurrentUser);
router.get("/get-followers", verifyUser, getUserFollowers);
router.patch("/change-password", verifyUser, changeCurrentPassword);
router.post("/follow/:username", verifyUser, followUser);
router.post("/unfollow/:username", verifyUser, unfollowUser);
router.post("/add-bio", verifyUser, addBio);
router.get("/get-user-profile-data/:username", verifyUser, getUserProfileData);
router.patch("/update-bio", verifyUser, updateBio);
router.patch(
  "/update-profile",
  verifyUser,
  upload.single("profileImage"),
  updateProfileImage
);

export default router;
