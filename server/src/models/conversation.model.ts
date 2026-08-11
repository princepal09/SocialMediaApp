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



conversationSchema.pre("save", function(){
    this.participants.sort((a:any, b:any) => {
     return a.toString().localCompare(b.toString())
    })
})


export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
