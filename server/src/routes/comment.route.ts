 import express from 'express'
import { createComment, deleteComment, getCommentsByPostId } from '../controllers/comment.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';

const router = express();


router.post("/create-comment/:postId", verifyUser, createComment);
router.get("/get-comments/:postId", verifyUser, getCommentsByPostId);
router.delete("/delete-comment/post/:postId/comment/:commentId", verifyUser, deleteComment);


export default router;