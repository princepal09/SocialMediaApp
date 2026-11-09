import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { env } from "../constants.js";

export interface MyJwtPayload extends JwtPayload {
  _id: string;
}

export const getAccessUser = (token: string) => {
  const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET, {
    algorithms: ["HS256"],
  }) as MyJwtPayload;
  return User.findById(payload._id);
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  try {
    const user = token ? await getAccessUser(token) : null;
    if (user) {
      req.user = user;
      return next();
    }
  } catch (error) {
    if (!(error instanceof jwt.JsonWebTokenError)) return next(error);
  }

  return res.status(401).json({
    success: false,
    code: "ACCESS_TOKEN_REQUIRED",
    message: "Please sign in to continue.",
  });
};
