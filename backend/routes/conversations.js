import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

// @route   GET /api/conversations
// @desc    Get all conversations
router.get("/", async (req, res) => {
  try {
    // In a real app we'd filter by userId from auth token:
    // const conversations = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// @route   POST /api/conversations
// @desc    Create a new conversation
router.post("/", async (req, res) => {
  try {
    const { moduleType, userId, title } = req.body;
    
    const newConversation = new Conversation({
      userId: userId || "guest",
      moduleType: moduleType || "chat",
      title: title || "New Conversation"
    });

    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// @route   GET /api/conversations/:id
// @desc    Get conversation by ID along with its messages
router.get("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json({ conversation, messages });
  } catch (error) {
    console.error("Error fetching conversation details:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// @route   DELETE /api/conversations/:id
// @desc    Delete conversation and associated messages
router.delete("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Delete associated messages
    await Message.deleteMany({ conversationId: req.params.id });
    
    // Delete conversation
    await conversation.deleteOne();
    
    res.json({ msg: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
