import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Request, Response } from "express";
import {
  removeFromCloudinary,
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import { io } from "../index.js";
import { redisClient } from "../config/redis.js";
import { invalidatePostCaches } from "../utils/cache.js";

export const createPost = async (req: Request, res: Response) => {
  try {
    const files =
      (req.files as {
        image?: Express.Multer.File[];
        video?: Express.Multer.File[];
      }) ?? {};

    const imageFiles = files.image ?? [];
    const videoFiles = files.video ?? [];

    const hasImage = imageFiles.length > 0;
    const hasVideo = videoFiles.length > 0;

    // Cannot upload both
    if (hasImage && hasVideo) {
      throw new ApiError(
        400,
        "You can upload either an image or a video, not both"
      );
    }

    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const hasContent = typeof content === "string" && content.trim().length > 0;

    // At least one thing is required
    if (!hasContent && !hasImage && !hasVideo) {
      throw new ApiError(400, "Post must contain text, an image, or a video");
    }

    let imageUrl: string | undefined;
    let videoUrl: string | undefined;

    // Upload image
    if (hasImage && files.image?.[0]?.path) {
      const imageResult = await uploadToCloudinary(files.image[0].path);

      imageUrl = imageResult?.secure_url;
    }

    // Upload video
    if (hasVideo && files.video?.[0]?.path) {
      const videoResult = await uploadVideoToCloudinary(files.video[0].path);

      if (!videoResult) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
      }

      videoUrl = videoResult.eager?.[0]?.secure_url ?? videoResult.secure_url;
    }

    const sanitizedContent = hasContent
      ? sanitizeHtml(content, {
          allowedTags: [
            "p",
            "br",
            "strong",
            "em",
            "s",
            "u",
            "h1",
            "h2",
            "h3",
            "ul",
            "ol",
            "li",
            "blockquote",
            "code",
            "pre",
          ],
          allowedAttributes: {},
        })
      : "";

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const post = await Post.create({
      content: sanitizedContent,
      image: imageUrl,
      video: videoUrl,
      owner: userId,
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        posts: post._id,
      },
    });

    const populatedPost = await Post.findById(post._id)
      .populate("owner", "username profileImage")
      .lean();

    if (!populatedPost) {
      throw new ApiError(500, "Failed to populate post");
    }

    const formattedPost = {
      ...populatedPost,
      likes: [],
      likeCount: 0,
      commentsCount: 0,
      comments: [],
    };

    io.emit("new_post", formattedPost);

    await redisClient.del("home:posts");
    await redisClient.del(`user:posts:${user.username}`);

    return res
      .status(201)
      .json(new ApiResponse(201, formattedPost, "Post uploaded successfully"));
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
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(401, "Not authorized");
    }

    const cacheKey = "home:posts";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedData),
            "Posts fetched from cache"
          )
        );
    }
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

    await redisClient.set(cacheKey, JSON.stringify(posts), {
      EX: 60,
    });

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

    const cacheKey = `user:posts:${username}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedData),
            "User posts fetched from cache"
          )
        );
    }

    const userPosts = await Post.aggregate([
      // Fetch post owner
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

      // Match by username
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
          video: 1,
          createdAt: 1,

          commentCount: 1,
          likesCount: 1,

          // Return only the ObjectIds of users who liked the post
          likes: 1,

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

    await redisClient.set(cacheKey, JSON.stringify(userPosts), {
      EX: 60,
    });

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

    if (!content || content.trim() === "") {
      throw new ApiError(400, "Content is required to update");
    }

    if (!userId) {
      throw new ApiError(401, "User id not found");
    }

    if (!postId) {
      throw new ApiError(404, "Post Id not found");
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw new ApiError(404, "Post Not Found");
    }

    if (!post.owner.equals(userId)) {
      throw new ApiError(403, "You are not authorized to perform this action");
    }

    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [
        "p",
        "br",
        "strong",
        "em",
        "s",
        "u",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
      ],
      allowedAttributes: {},
    });

    post.content = sanitizedContent;

    await post.save({
      validateBeforeSave: false,
    });

    // Invalidate caches
    await invalidatePostCaches(req.user?.username);

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
      throw new ApiError(400, "Post ID not found");
    }

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    // Find post and verify ownership
    const post = await Post.findOne({
      _id: postId,
      owner: userId,
    });

    if (!post) {
      throw new ApiError(404, "Post not found or unauthorized");
    }

    // Delete image from Cloudinary
    if (typeof post.image === "string" && post.image.length > 0) {
      await removeFromCloudinary(post.image);
    }

    // Delete video from Cloudinary
    if (typeof post.video === "string" && post.video.length > 0) {
      await removeFromCloudinary(post.video);
    }

    // Delete post from MongoDB
    await Post.findByIdAndDelete(post._id);

    // Remove post reference from user
    await User.findByIdAndUpdate(userId, {
      $pull: {
        posts: post._id,
      },
    });

    // Invalidate caches AFTER successful database updates
    await invalidatePostCaches(req.user?.username);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Post deleted successfully"));
  } catch (err: any) {
    console.error("Delete Post Error:", err);

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

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!postId || !mongoose.isValidObjectId(postId)) {
      throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findOne({
      _id: postId,
      owner: userId,
    });

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, post, "Post fetched successfully"));
  } catch (err: unknown) {
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
