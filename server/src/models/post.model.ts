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
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>("Post", postSchema);
