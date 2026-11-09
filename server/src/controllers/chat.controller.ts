import { Request, Response } from "express";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { io } from "../realtime.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { receiverId } = req.params;

    if (!userId || typeof receiverId !== "string" || !mongoose.isValidObjectId(receiverId)) {
      throw new ApiError(400, "Invalid recipient.");
    }

    if (userId.toString() === receiverId.toString()) {
      throw new ApiError(400, "Cannot chat with yourself");
    }

    if (!(await User.exists({ _id: receiverId }))) {
      throw new ApiError(404, "Recipient not found.");
    }

    const participants = [userId, receiverId].sort();

    let conversation = await Conversation.findOne({
      participants: {
        $all: participants,
        $size: 2,
      },
    });

    let isNew = false;

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
      });

      isNew = true;
    }

    if (isNew) {
      participants.forEach((participantId: any) => {
        const userRoom = participantId.toString();

        io.to(userRoom).emit("conversation_created", {
          conversationId: conversation!._id,
        });

        io.to(userRoom).emit("conversation_updated");
      });
    }

    return res
      .status(isNew ? 201 : 200)
      .json(
        new ApiResponse(
          isNew ? 201 : 200,
          conversation,
          isNew
            ? "Conversation Created Successfully"
            : "Conversation Fetched Successfully"
        )
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

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?._id;

    if (!senderId) {
      throw new ApiError(404, "Sender id not found");
    }

    const { conversationId, text } = req.body ?? {};
    const messageText = typeof text === "string" ? text.trim() : "";
    if (typeof conversationId !== "string" || !mongoose.isValidObjectId(conversationId)) {
      throw new ApiError(400, "Invalid conversation.");
    }
    if ((!messageText && !req.file) || messageText.length > 4000) {
      throw new ApiError(400, "Send an image or a message up to 4,000 characters.");
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

    const socketPayload = {
      conversationId: conversationId.toString(),
      message: populatedMessage,
    };

    conversation.participants.forEach((participantId: any) => {
      const userRoom = participantId.toString();

      io.to(userRoom).emit("new_message", socketPayload);

      io.to(userRoom).emit("conversation_updated");
    });

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
    if (typeof conversationId !== "string" || !mongoose.isValidObjectId(conversationId)) {
      throw new ApiError(400, "Invalid conversation.");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    if (!conversation.participants.some((id: any) => id.equals(userId))) {
      throw new ApiError(403, "Not Authorized");
    }
    const page = Number(req.query.page) || 1;
    if (!Number.isSafeInteger(page) || page < 1 || page > 1000) {
      throw new ApiError(400, "Invalid message page.");
    }
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

    if (typeof conversationId !== "string" || !mongoose.isValidObjectId(conversationId)) {
      throw new ApiError(400, "Invalid conversation.");
    }
    if (!(await Conversation.exists({ _id: conversationId, participants: userId }))) {
      throw new ApiError(404, "Conversation not found.");
    }
    const { modifiedCount } = await Message.updateMany(
      { conversation: conversationId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    if (modifiedCount > 0) io.to(userId.toString()).emit("conversation_updated");

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
      .sort({ updatedAt: -1 })
      .lean();

    const unread = conversations.length ? await Message.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { conversation: { $in: conversations.map(({ _id }) => _id) }, seenBy: { $ne: userId } } },
      { $group: { _id: "$conversation", count: { $sum: 1 } } },
    ]) : [];
    const counts = new Map(unread.map(({ _id, count }) => [_id.toString(), count]));
    const conversationsWithUnread = conversations.map((conversation) => ({
      ...conversation,
      unreadCount: counts.get(conversation._id.toString()) ?? 0,
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          conversationsWithUnread,
          "Conversation fetched Successfully"
        )
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
