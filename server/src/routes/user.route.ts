import express from "express";
import {
  addBio,
  changeCurrentPassword,
  getCurrentUser,
  getUserProfileData,
  updateBio,
  updateProfileImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = express();



//user
router.get("/current-user", verifyUser, getCurrentUser);
router.patch("/change-password", verifyUser, changeCurrentPassword);
router.post("/add-bio", verifyUser, addBio);
router.get("/get-user-profile-data/:username", getUserProfileData);
router.patch("/update-bio", verifyUser, updateBio);
router.patch("/update-profile", verifyUser, upload.single("profileImage"), updateProfileImage);

export default router;
