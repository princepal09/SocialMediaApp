import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { userInfo } from "os";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || username === "") {
      throw new ApiError(400, "username is required");
    }
    if (!email || email === "") {
      throw new ApiError(400, "email is required");
    }
    if (!email.includes("@")) {
      throw new ApiError(400, "invalid emaill");
    }
    if (!password || password === "") {
      throw new ApiError(400, "password is required");
    }

    let profileImageLocalPath;
    let profileImageUrl;
    if (req.file?.path) {
      profileImageLocalPath = req.file.path;
      const cloudinaryResult = await uploadToCloudinary(profileImageLocalPath);
      if (cloudinaryResult?.secure_url) {
        profileImageUrl = cloudinaryResult.secure_url;
      }
    }

    console.log("File is uploaded on cloudinary", profileImageUrl);

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "User with this email or username is already exisits"
      );
    }

    let user;
    if (profileImageUrl) {
      user = await User.create({
        username,
        email,
        password,
        profileImage: profileImageUrl,
      });
    } else {
      user = await User.create({
        username,
        email,
        password,
      });
    }

    if (!user) {
      throw new ApiError(500, "Something went wrong while creating the user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully!!"));
  } catch (err: any) {
    console.error("ERROR", err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};
