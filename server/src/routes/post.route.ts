import express from 'express'
import { createPost } from '../controllers/post.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';

const router = express();


router.get("/create-post", verifyUser, createPost);


export default router;