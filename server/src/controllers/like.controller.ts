import { Request, Response } from "express";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const togglePostLike = async (req: Request, res: Response) => {
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

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await Post.findByIdAndUpdate(postId, {
        $pull: {
          likes: userId,
        },
      });
      return res
        .status(201)
        .json(new ApiResponse(201, null, "You unliked the post"));
    } else {
      await Post.findByIdAndUpdate(postId, {
        $addToSet: {
          likes: userId,
        },
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, null, "You Liked the post"));
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

export const getUsersWhoLikedPost = async (req: Request, res: Response) => {
  try {
    const  postId  = req.params.postId as string;
    const userId = req.user?._id;

    if (!postId) {
      throw new ApiError(404, "Post Id not found");
    }

    if (!userId) {
      throw new ApiError(404, "User Id not found");
    }

    const result = await Post.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(postId),
        },
      },

      {
        $addFields: {
          likes: {
            $ifNull: ["$likes", []],
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likedUsers",
        },
      },

      {
        $project: {
          _id: 0,
          likedUsers: {
            $map: {
              input: "$likedUsers",
              as: "user",
              in: {
                _id: "$$user._id",
                username: "$$user.username",
                profileImage: "$$user.profileImage",
              },
            },
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result[0]?.likedUsers || [],
          "Users fetched successfully"
        )
      );
  } catch (err: any) {
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
