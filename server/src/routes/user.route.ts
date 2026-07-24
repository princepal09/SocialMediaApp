import express from 'express'
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyUser } from '../middlewares/auth.middleware.js';
const router = express();


router.post("/register", upload.single("profileImage"), registerUser)
router.post("/login", loginUser)
router.post("/refresh-token", refreshAccessToken)

//secured routes
router.post("/logout", verifyUser, logoutUser)
router.get("/current-user", verifyUser, getCurrentUser)


export default router;