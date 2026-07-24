import express from 'express'
import { loginUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = express();


router.post("/register", upload.single("profileImage"), registerUser)
router.post("/login", loginUser)


export default router;  