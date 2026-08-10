import mongoose from "mongoose";
import { IConversation } from "../../types/model.js";

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);



export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
