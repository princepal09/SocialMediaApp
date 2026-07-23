import express from 'express'
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = express();


router.post("/register", upload.single("profileImage"), registerUser)


export default router;  