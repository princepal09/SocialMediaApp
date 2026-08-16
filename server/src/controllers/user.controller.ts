import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { env } from "../constants.js";
import { MyJwtPayload } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs";
import type { CookieOptions } from "express";
import { io } from "../index.js";

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

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(500, "Error while creating the user");
    }

    const accessToken = createdUser.generateAccessToken();
    const refreshToken = createdUser.generateRefreshToken();

    createdUser.refreshToken = refreshToken;
    await createdUser.save({ validateBeforeSave: false });

     const isProduction = env.NODE_ENV === "production";

    const cookieOptions:CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          201,
          {
            success: true,
            user: createdUser,
            accessToken,
            refreshToken,
          },
          "User registered successfully!!"
        )
      );
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
      throw new ApiError(400, "Password required");
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      throw new ApiError(404, "User not exists, Please SignUp First");
    }

    const isPwdValid = await user.isPasswordCorrect(password);
    if (!isPwdValid) {
      throw new ApiError(401, "Password is not valid");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const isProduction = env.NODE_ENV === "production";

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    return res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "Login Successfully"
        )
      );
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

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );

    const cookieOption = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", cookieOption)
      .clearCookie("refreshToken", cookieOption)
      .json(new ApiResponse(200, null, "User Logged Out Successfully"));
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

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.header("Auhtorization")?.split("")[1];

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decode = jwt.verify(
      incomingRefreshToken,
      env.ACCESS_TOKEN_SECRET
    ) as MyJwtPayload;

    const user = await User.findById(decode._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token in invalid or expired");
    }

    const newRefreshToken = user.generateRefreshToken();
    const newAccessToken = user.generateAccessToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const isProduction = env.NODE_ENV === "production";

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };
    return res
      .status(201)
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          201,
          { refreshToken: newRefreshToken, accessToken: newAccessToken },
          "Refresh Token successfully created"
        )
      );
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

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized acces");
    }

    return res.status(200).json(new ApiResponse(200, user, "CURRENT USER"));
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

export const changeCurrentPassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new ApiError(400, "All passwords are required");
    }

    if (confirmPassword !== newPassword) {
      throw new ApiError(401, "New password and confirm password do not match");
    }

    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "Unauthorized access");
    }

    const isPasswordMatch = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordMatch) {
      throw new ApiError(401, "Password is not matching");
    }

    user.password = confirmPassword;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password changed successfully!!"));
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

export const addBio = async (req: Request, res: Response) => {
  try {
    const { bio } = req.body;
    if (!bio || bio === "") {
      throw new ApiError(400, "Bio is required");
    }

    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(409, "User is not found");
    }

    user.bio = bio.trim();
    await user.save({ validateBeforeSave: false });

    return res
      .status(201)
      .json(new ApiResponse(201, user, "Bio Added Successfully!!"));
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

export const updateBio = async (req: Request, res: Response) => {
  try {
    const { updateBio } = req.body;
    if (!updateBio || updateBio === "") {
      throw new ApiError(400, "Bio is required");
    }

    const userId = req.user?._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { bio: updateBio },
      },
      {
        new: true,
      }
    );

    if (!user) {
      throw new ApiError(404, "User Not found");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, user, "Bio Updated Successfully!!"));
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

export const updateProfileImage = async (req: Request, res: Response) => {
  try {
    let profileImagePath = req.file?.path;
    if (!profileImagePath) {
      throw new ApiError(400, "Profile Image is Required");
    }

    const userId = req.user?._id;
    if (!userId) {
      fs.unlinkSync(profileImagePath);
      throw new ApiError(500, "User id not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      fs.unlinkSync(profileImagePath);
      throw new ApiError(500, "User not found");
    }

    if (!user.profileImage) {
      const profileImage = await uploadToCloudinary(profileImagePath);
      user.profileImage = profileImage?.secure_url;
      await user.save({ validateBeforeSave: false });
      return res
        .status(201)
        .json(new ApiResponse(201, null, "Profile Image Added Successfully"));
    } else {
      const oldProfileImageUrl = user.profileImage;
      await removeFromCloudinary(oldProfileImageUrl);
      const newProfileImage = await uploadToCloudinary(profileImagePath);
      user.profileImage = newProfileImage?.secure_url;
      await user.save({ validateBeforeSave: false });

      return res
        .status(201)
        .json(new ApiResponse(201, user, "Profile Image Updated Successfully"));
    }
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

//create controller to get user profile details. It should contain posts, followers and followings.
// Here I need to use mongoDB populate

export const getUserProfileData = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    if (!username) {
      throw new ApiError(401, "Unauthorized");
    }
    const loggedInUserId = req.user?.id
      ? new mongoose.Types.ObjectId(req.user.id)
      : null;
    // console.log("loggedInUserId", loggedInUserId);
    // console.log("TYPE", typeof loggedInUserId);

    const profileData = await User.aggregate([
      {
        $match: {
          username: username,
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "owner",
          as: "posts",
        },
      },
      {
        $addFields: {
          postCount: { $size: "$posts" },
          followersCount: { $size: "$followers" },
          followingCount: { $size: "$following" },
          isFollowing: loggedInUserId
            ? { $in: [loggedInUserId, "$followers"] }
            : false,
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          bio: 1,
          profileImage: 1,
          postCount: 1,
          followersCount: 1,
          followingCount: 1,
          isFollowing: 1,
        },
      },
    ]);

    if (!profileData.length) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, profileData[0], "User data fetched successfully!")
      );
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

//create a controller to follow and unfollow
export const followUser = async (req: Request, res: Response) => {
  let session: mongoose.ClientSession | null = null;

  try {
    const { username } = req.params;
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      throw new ApiError(401, "LoggedIn user not found");
    }

    session = await mongoose.startSession();
    session.startTransaction();

    // Find the user to follow
    const userToBeFollowed = await User.findOne({
      username,
    }).session(session);

    if (!userToBeFollowed) {
      throw new ApiError(404, "User not found");
    }

    // Prevent self follow
    if (userToBeFollowed._id.equals(loggedInUserId)) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    // Check if already following
    const alreadyFollowing = await User.exists({
      _id: loggedInUserId,
      following: userToBeFollowed._id,
    }).session(session);

    if (alreadyFollowing) {
      throw new ApiError(400, "You are already following this user");
    }

    // Add logged-in user to target user's followers
    await User.findByIdAndUpdate(
      userToBeFollowed._id,
      {
        $addToSet: {
          followers: loggedInUserId,
        },
      },
      {
        session,
      }
    );

    // Add target user to logged-in user's following
    await User.findByIdAndUpdate(
      loggedInUserId,
      {
        $addToSet: {
          following: userToBeFollowed._id,
        },
      },
      {
        session,
      }
    );

    // Commit transaction first
    await session.commitTransaction();

    // 🔴 LIVE FOLLOW NOTIFICATION
    if (userToBeFollowed._id.toString() !== loggedInUserId.toString()) {
      io.to(userToBeFollowed._id.toString()).emit("userFollowed", {
        followedBy: {
          _id: loggedInUserId,
          username: req.user?.username,
          profileImage: req.user?.profileImage,
        },

        message: `${req.user?.username} started following you`,
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `You are now following ${userToBeFollowed.username}`
        )
      );
  } catch (err: any) {
    if (session) {
      await session.abortTransaction();
    }

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
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  let session: mongoose.ClientSession | null = null;

  try {
    const loggedInUserId = req.user?._id;
    const { username } = req.params;

    if (!loggedInUserId) {
      throw new ApiError(401, "Logged In User not found");
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const userToBeUnfollowed = await User.findOne({ username }).session(
      session
    );

    if (!userToBeUnfollowed) {
      throw new ApiError(404, "User not found");
    }

    // Prevent self-unfollow
    if (userToBeUnfollowed._id.equals(loggedInUserId)) {
      throw new ApiError(400, "You cannot unfollow yourself");
    }

    // Check if actually following
    const isFollowing = await User.exists({
      _id: loggedInUserId,
      following: userToBeUnfollowed._id,
    }).session(session);

    if (!isFollowing) {
      throw new ApiError(400, "You are not following this user");
    }

    // Remove logged-in user from target user's followers
    await User.findByIdAndUpdate(
      userToBeUnfollowed._id,
      {
        $pull: {
          followers: loggedInUserId,
        },
      },
      { session }
    );

    // Remove target user from logged-in user's following
    await User.findByIdAndUpdate(
      loggedInUserId,
      {
        $pull: {
          following: userToBeUnfollowed._id,
        },
      },
      { session }
    );

    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `You unfollowed ${userToBeUnfollowed.username}`
        )
      );
  } catch (err: any) {
    if (session) {
      await session.abortTransaction();
    }

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
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

export const getUserFollowers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(404, "User not found");
    }

    const user = await User.findById(userId).populate(
      "followers",
      "username profileImage"
    );
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Followers Fetches Successfully"));
  } catch (err: any) {
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

export const searchUser = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      throw new ApiError(400, "Search query is required");
    }

    const currentUserId = (req as any).user?._id;

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { bio: { $regex: query, $options: "i" } },
          ],
        },
        {
          _id: { $ne: currentUserId },
        },
      ],
    })
      .select("username bio profileImage")
      .limit(10);

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched Successfully"));
  } catch (err: any) {
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
