import { Request, Response } from "express";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { io } from "../index.js";

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
    // Populate the user
    await newComment.populate({
      path: "commentedBy",
      select: "username profileImage ",
    });

    await session.commitTransaction();

    if (post.owner.toString() !== userId.toString()) {
      io.to(post.owner.toString()).emit("postComment", {
        postId,
        commentedBy : {
          _id : userId,
        },
        message: `${req.user?.username} commented on your post`,
      });
    }

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
    const { postId } = req.params;
    if (!postId) {
      throw new ApiError(401, "Post Id not found");
    }
    const comments = await Comment.find({
      post: postId,
    })
      .populate({
        path: "commentedBy",
        select: "username profileImage",
      })
      .exec();

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched Successfully"));
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

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId, postId } = req.params;
    const userId = req.user?._id;

    if (!commentId) throw new ApiError(400, "Comment Id not found");
    if (!postId) throw new ApiError(400, "Post Id not found");
    if (!userId) throw new ApiError(401, "User not authenticated");

    const post = await Post.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Only comment owner or post owner can delete
    const isCommentOwner = comment.commentedBy.equals(userId);
    const isPostOwner = post.owner.equals(userId);

    if (!isCommentOwner && !isPostOwner) {
      throw new ApiError(403, "You are not authorized to perform this action");
    }

    await Comment.findByIdAndDelete(commentId);

    await Post.findByIdAndUpdate(postId, {
      $pull: {
        comments: comment._id,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment deleted successfully"));
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
