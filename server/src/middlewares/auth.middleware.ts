import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";

export interface MyJwtPayload extends JwtPayload {
  _id: string;
}

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Unauthorized Access");
    }

    console.log("accessToken", token);

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as MyJwtPayload;

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if(!user){
        throw new ApiError(401, "Invalid access token");
    }
    console.log(user);
    req.user = user;

    return next();

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
