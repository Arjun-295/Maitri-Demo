import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest",
    },
    title: {
      type: String,
      default: "New Conversation",
    },
    moduleType: {
      type: String,
      default: "chat",
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
