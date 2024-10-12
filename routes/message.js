import express from "express";
import { createNewChat, getAllChats, clearUnreadMessages, newMessage, getAllMessages } from "../controllers/messageController";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create-new-chat", authenticateUser, createNewChat);
router.get("/get-all-chats", authenticateUser, getAllChats);
router.post("/clear-unread-messages", authenticateUser, clearUnreadMessages);
router.post("/new-message", authenticateUser, newMessage);
router.get("/get-all-messages/:chatId", authenticateUser, getAllMessages);

export default router;
