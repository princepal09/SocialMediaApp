import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { env } from "../constants.js";
import { MyJwtPayload } from "../middlewares/auth.middleware.js";
import jwt from 'jsonwebtoken'
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

    const cookieOptions = {
      httpOnly: true,
      secure: true,
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
    console.error("ERROR WHILE REGISTER", err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    console.log(password);
    if (!username && !email) {
      throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
      throw new ApiError(400, "Password required");
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError(404, "User not exists, Please SignUp First");
    }

    const isPwdValid = user.isPasswordCorrect(password);
    if (!isPwdValid) {
      throw new ApiError(401, "Password is not valid");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

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
        console.log("ERROR WHILE LOGIN", err);

    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, {
        $unset : {
            refreshToken : 1
        }
    }, {new : true})

    const cookieOption = {
         httpOnly : true,
         secure : true
    }

    return res.status(200)
    .clearCookie("accessToken", cookieOption)
    .clearCookie("refreshToken", cookieOption)
    .json(
        new ApiResponse(200, null, "User Logged Out Successfully")
    )
  } catch (err: any) {
    console.log("ERROR WHILE LOGOUT ", err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};


export const refreshAccessToken = async(req:Request,res:Response) =>{
  try{
    const incomingRefreshToken = req.cookies.refreshToken || req.header("Auhtorization")?.split("")[1];

    if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized Request");
    }

    const decode = jwt.verify(incomingRefreshToken, env.ACCESS_TOKEN_SECRET) as MyJwtPayload

    const user = await User.findById(decode._id);

    if(!user){
      throw new ApiError(401, "Invalid refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh Token in invalid or expired");
    }

    const newRefreshToken =  user.generateRefreshToken()
    const newAccessToken =  user.generateAccessToken()

    user.refreshToken = newRefreshToken
    await user.save({validateBeforeSave : false});

    const cookieOptions = {
      httpOnly : true,
      secure : true
    }
    return res.status(201)
    .cookie("accessToken", newAccessToken,cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(201, {refreshToken:newRefreshToken, 
        accessToken: newAccessToken
      }, "Refresh Token successfully created")
    )


    


  }catch (err: any) {
    console.log("ERROR WHILE GET REFRESH TOKEN", err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }



}