import mongoose from "mongoose";

const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: true, // Ensure chat always has members
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadMessages: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model("Chat", chatSchema);
