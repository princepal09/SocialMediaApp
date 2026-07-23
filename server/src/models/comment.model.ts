import mongoose from "mongoose";
import { IComment } from "../../types/model.js";
const commentSchema = new mongoose.Schema<IComment>(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    commentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);