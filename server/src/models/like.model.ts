import mongoose from "mongoose";
import { ILike } from "../../types/model.js";

const likeSchema = new mongoose.Schema<ILike>(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


// Prevent duplicate likes
likeSchema.index({ post: 1, likedBy: 1 }, { unique: true });

export const Like = mongoose.model<ILike>("Like", likeSchema);