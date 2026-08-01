import express from 'express'
import { likeUnlikePost } from '../controllers/like.controller.js';


const router = express();


router.post("/like-unlike", likeUnlikePost);

export default router;