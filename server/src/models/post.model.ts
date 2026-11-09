import mongoose from "mongoose";
import { IPost } from "../types/model.js";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      default: "",
      required(this: IPost): boolean {
        return !this.image && !this.video;
      },
    },
    image: {
      type: String,
    },
    video : {
      type : String
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

postSchema.index({ createdAt: -1, _id: -1 });

export const Post = mongoose.model<IPost>("Post", postSchema);
