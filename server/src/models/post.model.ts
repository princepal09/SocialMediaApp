import mongoose from "mongoose";
import { IPost } from "../../types/model.js";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>("Post", postSchema);
