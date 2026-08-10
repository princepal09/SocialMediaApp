import express from 'express'
import { createPost, deletePost, getAllPostsForHome, getPostById, getUserPosts, updatePostContent } from '../controllers/post.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express();


router.post("/create-post", verifyUser, upload.single("image"), createPost);
router.delete("/delete-post/:postId", verifyUser, deletePost);
router.get("/all-posts", verifyUser, getAllPostsForHome);
router.patch("/update-post-content/:postId", verifyUser, updatePostContent);
router.get("/get-user-posts/:username", verifyUser, getUserPosts);
router.get("/get-post/:postId", verifyUser, getPostById);


export default router;