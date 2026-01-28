/**
 * MAITRI Backend Server
 *
 * Express server for the MAITRI AI assistant chat API.
 * Provides psychological and physical well-being support for astronauts.
 */

import express from "express";
import cors from "cors";
import config from "./config/index.js";
import chatRoutes from "./routes/chat.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import http from "http";
import { WebSocketServer } from "ws";
import { createDeepgramStream, streamTTS } from "./services/deepgram.js";
import { createMaitriChain } from "./services/langchain.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MAITRI_VOICE_PROMPT } from "./prompts/maitriPromptVoice.js";

// Initialize Express app
const app = express();

// -----------------
// Create HTTP Server
// -----------------
const server = http.createServer(app);

// -----------------
// WebSocket: Voice Streaming (Phase 1)
// -----------------
const wss = new WebSocketServer({ server, path: "/ws/voice" });

wss.on("connection", (ws) => {
  console.log("🎤 Voice client connected");
  const { llm, addToHistory, getHistory, createPrompt } = createMaitriChain();
  const prompt = createPrompt(MAITRI_VOICE_PROMPT);
  const parser = new StringOutputParser();

  let dgReady = false;
  let isProcessing = false; // Prevent concurrent API calls
  let lastProcessTime = 0;
  const RATE_LIMIT_MS = 2000; // 2 second cooldown between API calls

  const dgStream = createDeepgramStream(async ({ text, isFinal }) => {
    if (!isFinal) return;

    // Rate limiting check
    const now = Date.now();
    if (isProcessing || now - lastProcessTime < RATE_LIMIT_MS) {
      console.log("⏳ Skipping (rate limited):", text);
      return;
    }

    isProcessing = true;
    lastProcessTime = now;
    console.log("📝 User: ", text);

    try {
      // Build the chain: prompt → llm → parser
      const chain = prompt.pipe(llm).pipe(parser);

      const response = await chain.invoke({
        text: text,
        history: getHistory(),
      });

      console.log("🤖 Maitri Response: ", response);

      await streamTTS({
        text: response,
        onAudioChunk: (chunk) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk); // binary PCM
          }
        },
        onEnd: () => {
          ws.send(JSON.stringify({ type: "tts_end" }));
        },
      });

      // Save to chat history
      addToHistory(text, response);
    } catch (error) {
      console.error("❌ LangChain Error:", error.message);
      console.error("Full error:", error);
    } finally {
      isProcessing = false; // Allow next request
    }
  });

  dgStream.on("open", () => {
    dgReady = true;
    console.log("✅ Ready to send audio to Deepgram");
  });

  ws.on("message", (data, isBinary) => {
    if (!isBinary) return;

    if (dgReady) {
      dgStream.send(data);
    }
  });

  ws.on("close", () => {
    dgStream.finish();
  });
});

// -----------------
// Middleware Setup
// -----------------

// Enable CORS for frontend requests
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Parse JSON request bodies
app.use(express.json());

// Request logging in development
if (config.nodeEnv === "development") {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// -----------------
// Routes
// -----------------

// Welcome route
app.get("/", (req, res) => {
  res.json({
    name: "MAITRI API",
    description:
      "Mental and Adaptive Intelligence for Therapeutic Response and Integration",
    version: "1.0.0",
    endpoints: {
      chat: "POST /api/chat",
      newSession: "POST /api/chat/new-session",
      health: "GET /api/chat/health",
    },
  });
});

// Chat API routes
app.use("/api/chat", chatRoutes);

// -----------------
// Error Handling
// -----------------

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// -----------------
// Start Server
// -----------------

server.listen(config.port, () => {
  console.log("");
  console.log("🚀 ═══════════════════════════════════════════════════════════");
  console.log("   MAITRI Backend Server Started Successfully");
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log(`   🌐 HTTP API:    http://localhost:${config.port}`);
  console.log(`   🎤 Voice WS:    ws://localhost:${config.port}/ws/voice`);
  console.log(`   🔧 Environment: ${config.nodeEnv}`);
  console.log(`   🤖 AI Model:    ${config.geminiModel}`);
  console.log(
    "═══════════════════════════════════════════════════════════════",
  );
  console.log("");
});

export default app;
