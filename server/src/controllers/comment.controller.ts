import { Request, Response } from "express";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { io } from "../index.js";
import { invalidatePostCaches } from "../utils/cache.js";

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
      throw new ApiError(401, "User Id not found");
    }

    if (!comment || comment.trim() === "") {
      throw new ApiError(400, "Comment is required to perform further action");
    }

    // Populate post owner to get username
    const post = await Post.findById(postId)
      .populate({
        path: "owner",
        select: "username",
      })
      .session(session);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    // Create comment
    const newComment = new Comment({
      comment: comment.trim(),
      post: postId,
      commentedBy: userId,
    });

    await newComment.save({ session });

    // Add comment to post
    await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: newComment._id,
        },
      },
      { session }
    );

    // Populate comment author
    await newComment.populate({
      path: "commentedBy",
      select: "username profileImage",
    });

    // Commit database transaction first
    await session.commitTransaction();

    // Get populated post owner
    const owner = post.owner as any;

    // Invalidate caches
    await invalidatePostCaches(owner.username);

    // Send socket notification
    if (owner._id.toString() !== userId.toString()) {
      io.to(owner._id.toString()).emit("postComment", {
        postId,

        commentedBy: {
          _id: userId,
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

    if (!commentId) {
      throw new ApiError(400, "Comment Id not found");
    }

    if (!postId) {
      throw new ApiError(400, "Post Id not found");
    }

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    // Populate owner so we can get username for cache invalidation
    const post = await Post.findById(postId).populate("owner", "username");

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Only comment owner or post owner can delete
    const isCommentOwner = comment.commentedBy.equals(userId);

    const owner = post.owner as any;

    const isPostOwner = owner._id.equals(userId);

    if (!isCommentOwner && !isPostOwner) {
      throw new ApiError(403, "You are not authorized to perform this action");
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    // Remove comment reference from post
    await Post.findByIdAndUpdate(postId, {
      $pull: {
        comments: comment._id,
      },
    });

    // Invalidate caches AFTER database updates
    await invalidatePostCaches(owner.username);

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
