import { Request, Response } from "express";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const likeUnlikePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { postId } = req.params;

    if (!postId) {
      throw new ApiError(404, "Post Id not found");
    }
    if (!userId) {
      throw new ApiError(401, "User ID Not Found");
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post Not Found");
    }

    console.log(post);
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
