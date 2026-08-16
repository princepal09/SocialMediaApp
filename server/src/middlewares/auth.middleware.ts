import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { env } from "../constants.js";

export interface MyJwtPayload extends JwtPayload {
  _id: string;
}

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("========== AUTH DEBUG ==========");
    console.log("NODE_ENV:", env.NODE_ENV);
    console.log("Cookies:", req.cookies);
    console.log("Access Token:", req.cookies?.accessToken);
    console.log(
      "Authorization:",
      req.header("Authorization")
    );
    console.log("================================");

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Unauthorized Access - No token received",
      });
    }

    const decoded = jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET!
    ) as MyJwtPayload;

    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Invalid access token - User not found",
      });
    }

    req.user = user;

    return next();
  } catch (error: any) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      status: 401,
      success: false,
      message: error?.message || "Invalid or expired token",
    });
  }
};