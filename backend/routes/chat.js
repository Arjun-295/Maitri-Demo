/**
 * Chat Routes
 *
 * API endpoints for MAITRI chat functionality
 */

import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import maitriService from "../services/maitriChain.js";
import { getTTSBuffer } from "../services/deepgram.js";
import Conversation from "../models/Conversation.js";

const router = Router();

/**
 * POST /api/chat
 * Send a message to MAITRI and receive a response
 *
 * Request body:
 * - message: string (required) - The user's message
 * - sessionId: string (optional) - Session ID for conversation continuity
 * - emotion: string (optional) - Detected user emotion for empathetic responses
 *
 * Response:
 * - response: string - MAITRI's response
 * - sessionId: string - Session ID for future requests
 */
router.post("/", async (req, res, next) => {
  try {
    const { message, sessionId, emotion, moduleType } = req.body;

    // Validate message
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Message is required and must be a non-empty string",
      });
    }

    // Use provided sessionId (which is now MongoDB ObjectId) or create a new Conversation
    let currentSessionId = sessionId;
    if (!currentSessionId || currentSessionId.length < 24) {
      // Create new conversation document
      const newConv = await Conversation.create({
        title: "New Chat",
        moduleType: moduleType || "default",
        userId: "guest"
      });
      currentSessionId = newConv._id.toString();
    }

    // Get response from MAITRI (saves messages over in the service)
    const result = await maitriService.chat(
      currentSessionId,
      message.trim(),
      emotion,
      moduleType
    );

    res.json({
      response: result.response,
      sessionId: currentSessionId,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat/new-session
 * Start a new conversation session
 *
 * Request body:
 * - sessionId: string (optional) - Previous session ID to clear
 *
 * Response:
 * - sessionId: string - New session ID
 * - message: string - Confirmation message
 */
router.post("/new-session", async (req, res) => {
  const { moduleType } = req.body;
  try {
    const newConv = await Conversation.create({
      title: "New Chat",
      moduleType: moduleType || "default",
      userId: "guest"
    });
    
    res.json({
      sessionId: newConv._id.toString(),
      message: "New session started successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create session" });
  }
});

/**
 * GET /api/chat/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "MAITRI Chat API",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/chat/tts
 * Generate TTS audio buffer for a given text
 * 
 * Query params:
 * - text: string (required) - Text to synthesize
 */
router.get("/tts", async (req, res, next) => {
  try {
    const { text } = req.query;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Query parameter 'text' is required" });
    }

    const audioBuffer = await getTTSBuffer(text);
    
    // Set headers for MP3 audio playback
    res.set("Content-Type", "audio/mpeg");
    res.set("Content-Length", audioBuffer.byteLength);
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    next(error);
  }
});

export default router;
