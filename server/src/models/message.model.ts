import mongoose from "mongoose";
import { IMessage } from "../../types/model.js";
import { Conversation } from "./conversation.model.js";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

messageSchema.pre("validate", function (next) {
  if (!this.text && !this.image) {
    next(new Error("Message must contains text or image"));
  } else {
    next();
  }
});

messageSchema.pre("save", function (next) {
  if (this.isNew && this.sender && (!this.seenBy || this.seenBy.length === 0)) {
    this.seenBy = [this.sender];
  }
  next();
});

messageSchema.index({
  conversation: 1,
  createdAt: -1,
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);
