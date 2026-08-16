import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  getMessages,
  getOrCreateConversation,
  getUserConversation,
  markSeen,
  sendMessage,
} from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post("/conversation/:receiverId", verifyUser, getOrCreateConversation);
router.post("/message", verifyUser, upload.single("image"), sendMessage);
router.get("/messages/:conversationId", verifyUser, getMessages);
router.patch("/seen/:conversationId", verifyUser, markSeen);
router.get("/user-conversations", verifyUser, getUserConversation);

export default router;
