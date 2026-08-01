import express from 'express'
import { togglePostLike } from '../controllers/like.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';


const router = express();


router.post("/like-unlike/:postId", verifyUser, togglePostLike);

export default router;