import { Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  posts: Types.ObjectId[];
  bio: string;
  profileImage: string;
  refreshToken?: string
  password: string;

  createdAt: Date;
  updatedAt: Date;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}


export interface IPost extends Document {
  content: string;
  image?: string;
  owner: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export interface ILike extends Document {
  post: Types.ObjectId;
  likedBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  post: Types.ObjectId;
  commentBy: Types.ObjectId;
  comment: string;

  createdAt: Date;
  updatedAt: Date;
}
