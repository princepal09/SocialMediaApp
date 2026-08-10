import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { getMessages, getOrCreateConversation, sendMessage } from "../controllers/chat.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express();


router.post("/conversation/:recieverId", verifyUser,  getOrCreateConversation)
router.post("/message", verifyUser, upload.single("image"), sendMessage)
router.get("/message/:conversationId" , verifyUser, getMessages)

export default router;
