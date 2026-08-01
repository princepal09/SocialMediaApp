import express from 'express'
import { getUsersWhoLikedPost, togglePostLike } from '../controllers/like.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';


const router = express();

    
router.post("/like-unlike/:postId", verifyUser, togglePostLike);
router.get("/get-user/:postId", verifyUser, getUsersWhoLikedPost);

export default router;