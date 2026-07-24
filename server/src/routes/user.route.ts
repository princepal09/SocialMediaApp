import express from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyUser } from '../middlewares/auth.middleware.js';
const router = express();


router.post("/register", upload.single("profileImage"), registerUser)
router.post("/login", loginUser)

//secured routes
router.post("/logout", verifyUser, logoutUser)


export default router;