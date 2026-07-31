import express from 'express'
import { createPost, getAllPostsForHome, getUserPosts } from '../controllers/post.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express();


router.post("/create-post", verifyUser, upload.single("image"), createPost);
router.get("/all-posts", verifyUser, getAllPostsForHome);
router.get("/get-user-posts/:username", verifyUser, getUserPosts);


export default router;