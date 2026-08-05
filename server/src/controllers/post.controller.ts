import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const createPost = async (req: Request, res: Response) => {
  try {
    const profileImagePath = req.file?.path;
    console.log("Body:", req.body);
    console.log("File:", req.file);
    const { content } = req.body;
    const userId = req.user?.id;
    let imageUrl;

    if (profileImagePath) {
      imageUrl = await uploadToCloudinary(profileImagePath);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const post = await Post.create({
      content,
      image: imageUrl?.secure_url,
      owner: userId,
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        posts: post._id,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, post, "Post Created Successfully"));
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        status: err.status,
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

//here i need to implement the mongodb aggregation pipeline to get the comments
export const getAllPostsForHome = async (req: Request, res: Response) => {
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "owner.password": 0,
          "owner.refreshToken": 0,
          "owner.__v": 0,
        },
      },

      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.commentedBy",
          foreignField: "_id",
          as: "commentUsers",
        },
      },
      {
        $addFields: {
          comments: {
            $map: {
              input: "$comments",
              as: "comment",
              in: {
                _id: "$$comment._id",
                comment: "$$comment.comment",
                createdAt: "$$comment.createdAt",
                commentedBy: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$commentUsers",
                              as: "user",
                              cond: {
                                $eq: ["$$user._id", "$$comment.commentedBy"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: "$$user._id",
                      username: "$$user.username",
                      profileImage: "$$user.profileImage",
                    },
                  },
                },
              },
            },
          },
        },
      },

      {
        $addFields: {
          commentsCount: {
            $size: "$comments",
          },
          likesCount: {
            $size: "$likes",
          },
        },
      },

      {
        $project: {
          commentUsers: 0,
          __v: 0,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    // console.log(posts);
    return res
      .status(200)
      .json(new ApiResponse(200, posts, "POSTS fetched Successfully"));
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        status: err.status,
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    if (!username) {
      throw new ApiError(401, "User Not Found");
    }

    const userPosts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $match: {
          "owner.username": username,
        },
      },

      // Fetch comments
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },

      // Fetch users who commented
      {
        $lookup: {
          from: "users",
          localField: "comments.commentedBy",
          foreignField: "_id",
          as: "commentUsers",
        },
      },

      {
        $addFields: {
          comments: {
            $map: {
              input: "$comments",
              as: "comment",
              in: {
                _id: "$$comment._id",
                comment: "$$comment.comment",
                createdAt: "$$comment.createdAt",
                commentedBy: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$commentUsers",
                        as: "user",
                        cond: {
                          $eq: ["$$user._id", "$$comment.commentedBy"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },

          commentCount: {
            $size: "$comments",
          },

          likesCount: {
            $size: {
              $ifNull: ["$likes", []],
            },
          },
        },
      },

      {
        $project: {
          content: 1,
          image: 1,
          createdAt: 1,
          commentCount: 1,
          likesCount: 1,

          owner: {
            _id: "$owner._id",
            username: "$owner.username",
            profileImage: "$owner.profileImage",
          },

          comments: {
            $map: {
              input: "$comments",
              as: "comment",
              in: {
                _id: "$$comment._id",
                comment: "$$comment.comment",
                createdAt: "$$comment.createdAt",
                commentedBy: {
                  _id: "$$comment.commentedBy._id",
                  username: "$$comment.commentedBy.username",
                  profileImage: "$$comment.commentedBy.profileImage",
                },
              },
            },
          },
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    
    return res
      .status(200)
      .json(new ApiResponse(200, userPosts, "User Posts Fetched Successfully"));
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        status: err.status,
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updatePostContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content === "") {
      throw new ApiError(400, "Content is required to update");
    }

    if (!userId) {
      throw new ApiError(404, "User id not found");
    }

    if (!postId) {
      throw new ApiError(404, "Post Id not found");
    }

    const post = await Post.findById(postId);

    console.log("POST to be updated", post);
    if (!post) {
      throw new ApiError(404, "Post Not Found");
    }

    if (!post.owner.equals(userId)) {
      throw new ApiError(401, "You are Not authorized to perform this action");
    }

    post.content = content;
    await post.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, post, "Post Updated Successfully"));
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        status: err.status,
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!postId) {
      throw new ApiError(401, "Post Id not found");
    }

    const post = await Post.findOneAndDelete({
      _id: postId,
      owner: userId,
    });

    if (!post) {
      throw new ApiError(404, "Post not found or unauthorized");
    }

    await User.findByIdAndUpdate(userId, {
      $pull: {
        posts: post._id,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Post deleted successfully"));
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
