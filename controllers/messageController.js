import Chat from "../models/chat";
import ErrorHandler from "../utils/errorHandler";
import Message from "../models/message";


export const createNewChat = async (req, res, next) => {
    try {
        const { _id } = req.user; // Extract user ID from req.user
        const newChat = new Chat({
            ...req.body,
            members: [_id, ...req.body.members], // Include current user in the chat members
        });
        const savedChat = await newChat.save();

        await savedChat.populate("members");

        res.status(200).json({
            success: true,
            message: "Chat created successfully", 
            data: savedChat,
        });
    } catch (error) {
        return next(error);
    }
};


// Get all chats for the current user
export const getAllChats = async (req, res, next) => {
    try {
        const { _id } = req.user; // Extract user ID from req.user
        const chats = await Chat.find({
            members: { $in: [_id] }, // Match authenticated user ID in the chat's members array
        })
            .populate("members")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            message: "Chats fetched successfully",
            data: chats,
        });
    } catch (error) {
        return next(error);
    }
};


// Clear unread messages for a specific chat
export const clearUnreadMessages = async (req, res, next) => {
    try {
        const { _id } = req.user; // Extract user ID from req.user
        const { chat: chatId } = req.body; // Get the chat ID from the request body

        // Find the chat by ID
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Update the unread messages count to 0
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { unreadMessages: 0 },
            { new: true }
        )
            .populate("members")
            .populate("lastMessage");

        // Mark all messages in this chat as read
        await Message.updateMany(
            { chat: chatId, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: "Unread messages cleared successfully",
            data: updatedChat,
        });
    } catch (error) {
        return next(error);
    }
};


// Send a new message in a chat
export const newMessage = async (req, res, next) => {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();

        // Update the last message of the chat and increment unread messages
        await Chat.findByIdAndUpdate(
            { _id: req.body.chat },
            {
                lastMessage: savedMessage._id,
                $inc: { unreadMessages: 1 }, // Increment unread messages by 1
            }
        );

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: savedMessage,
        });
    } catch (error) {
        return next(error);
    }
};


// Get all messages in a chat
export const getAllMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({
            chat: req.params.chatId,
        }).sort({ createdAt: 1 }); // Sort messages by creation time

        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            data: messages,
        });
    } catch (error) {
        return next(error);
    }
};
