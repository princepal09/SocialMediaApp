import { Request, Response } from "express";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { io } from "../index.js";
import { BooleanSchemaDefinition } from "mongoose";

export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { receiverId } = req.params;

    if (!userId || !receiverId) {
      throw new ApiError(404, "Invalid Users");
    }
    if (userId.toString() === receiverId.toString()) {
      throw new ApiError(400, "Cannot chat with yourself");
    }

    const participants = [userId, receiverId].sort();

    let conversation = await Conversation.findOne({
      participants: {
        $all: participants,
        $size: 2,
      },
    });

    let isNew : boolean = false;



    if (!conversation) {
      conversation = await Conversation.create({ participants });
      isNew = true;
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            conversation,
            "Conversastion Created Successfully"
          )
        );
    }


    if(isNew){
      participants.forEach((participantId : any) => {
        io.to(participantId.toString()).emit("conversation_created");
      })
    }

    
    

    return res
      .status(200)
      .json(new ApiResponse(200, conversation, "Conversastion fetched"));
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?._id;

    if (!senderId) {
      throw new ApiError(404, "Sender id not found");
    }

    const { conversationId, text } = req.body;

    const messageText = text?.trim();

    if (!conversationId) {
      throw new ApiError(404, "Conversation id not found");
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    const isParticipant = conversation.participants.some((id) =>
      id.equals(senderId)
    );

    if (!isParticipant) {
      throw new ApiError(403, "Not a participant");
    }

    let image;

    if (req.file?.path) {
      image = await uploadToCloudinary(req.file.path);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      ...(messageText && { text: messageText }),
      ...(image && { image: image.secure_url }),
      seenBy: [senderId],
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populatedMessage = await message.populate(
      "sender",
      "username profileImage"
    );

    io.to(conversationId.toString()).emit("new_message", populatedMessage);

    conversation.participants.forEach((participantId : any) => {
      io.to(participantId.toString()).emit("conversation_updated");

    })

    return res
      .status(201)
      .json(
        new ApiResponse(201, populatedMessage, "Message Sent Successfully")
      );
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const { conversationId } = req.params;
    if (!conversationId) {
      throw new ApiError(404, "Conversationid not found");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    if (!conversation.participants.some((id: any) => id.equals(userId))) {
      throw new ApiError(403, "Not Authorized");
    }
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res
      .status(200)
      .json(new ApiResponse(200, messages, "Message fetches Successfully"));
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const markSeen = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { conversationId } = req.params;
    if (!userId) {
      throw new ApiError(404, "User Id not found");
    }

    if (!conversationId) {
      throw new ApiError(404, "Conversation id not found");
    }
    await Message.updateMany(
      { conversation: conversationId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    io.to(userId.toString()).emit("conversation_updated");

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Message Marked as seen"));
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profileImage")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username profileImage",
        },
      })
      .sort({ updatedAt: -1 });

      const conversationsWithUnread = await Promise.all(
        conversations.map(async(conv) => {
          const unreadCount = await Message.countDocuments({
            conversation : conv._id,
            seenBy : {$ne : userId},
          });

          return {
            ...conv.toObject(),
            unreadCount
          }

        })
      )

    return res
      .status(200)
      .json(
        new ApiResponse(200, conversationsWithUnread, "Conversation fetched Successfully")
      );
  } catch (err: any) {
    console.error(err);

    if (err instanceof ApiError) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
