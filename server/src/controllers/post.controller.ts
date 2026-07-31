import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
          commentsCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          commentUsers: 0,
          __v: 0,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
    ]);
    console.log(posts);

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
