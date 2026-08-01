import { Request, Response } from "express";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const createComment = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { postId } = req.params;
    const userId = req.user?.id;
    const { comment } = req.body;

    if (!postId) {
      throw new ApiError(404, "Post Id not found");
    }

    if (!userId) {
      throw new ApiError(404, "User Id not found");
    }

    if (!comment || comment.trim() === "") {
      throw new ApiError(400, "Comment is required to perform further action");
    }

    const post = await Post.findById(postId).session(session);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const newComment = new Comment({
      comment: comment.trim(),
      post: postId,
      commentedBy: userId,
    });

    await newComment.save({ session });

    await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: newComment._id,
        },
      },
      { session }
    );

    await session.commitTransaction();

    return res
      .status(201)
      .json(new ApiResponse(201, newComment, "Comment created successfully"));
  } catch (err: any) {
    await session.abortTransaction();

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
  } finally {
    session.endSession();
  }
};

export const getCommentsByPostId = async (req: Request, res: Response) => {
  try {

    const {postId} = req.params;
    if(!postId){
        throw new ApiError(401, "Post Id not found");
    }
    const comments = await Comment.find({
        post : postId,

    })
    
     return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched Successfully")
     )

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
