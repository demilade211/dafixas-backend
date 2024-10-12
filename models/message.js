import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true, // A message must be linked to a chat
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // A message must have a sender
    },
    text: {
      type: String,
      trim: true, // Trim whitespace from the message text
    },
    image: {
      type: String,
      required: false, // Image is optional
    },
    read: {
      type: Boolean,
      default: false, // Default message status as unread
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model("Message", messageSchema);
