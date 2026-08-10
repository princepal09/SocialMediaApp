import { Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  posts: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  bio: string;
  profileImage: string | undefined;
  refreshToken?: string | undefined;
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
  comments: Types.ObjectId[];
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  post: Types.ObjectId;
  commentedBy: Types.ObjectId;
  comment: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  participants: Types.ObjectId [];
  lastMessage?: Types.ObjectId;
}

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  image?: string;
  seenBy: Types.ObjectId[];
  createdAt: Date;
}

