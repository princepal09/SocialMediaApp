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
    const { content } = req.body;
    const userId = req.user?.id;
    if (!profileImagePath) {
      throw new ApiError(400, "Profile Image is Required");
    }
    const imageUrl = await uploadToCloudinary(profileImagePath);

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    let post;
    if (imageUrl === undefined) {
      post = await Post.create({ content });
    } else {
      post = await Post.create({
        content,
        image: imageUrl.secure_url,
        owner: userId,
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, post, "Post Created Successfully"));
  } catch (err: any) {
    console.log("Error while updating the createPost error", err.message);
    return res.json(new ApiError(500, "Internal Server Error", err));
  }
};
