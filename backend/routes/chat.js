/**
 * Chat Routes
 * 
 * API endpoints for MAITRI chat functionality
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import maitriService from '../services/maitriChain.js';

const router = Router();

/**
 * POST /api/chat
 * Send a message to MAITRI and receive a response
 * 
 * Request body:
 * - message: string (required) - The user's message
 * - sessionId: string (optional) - Session ID for conversation continuity
 * 
 * Response:
 * - response: string - MAITRI's response
 * - sessionId: string - Session ID for future requests
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
      });
    }

    // Use provided sessionId or generate a new one
    const currentSessionId = sessionId || uuidv4();

    // Get response from MAITRI
    const result = await maitriService.chat(currentSessionId, message.trim());

    res.json({
      response: result.response,
      sessionId: result.sessionId,
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
router.post('/new-session', async (req, res) => {
  const { sessionId } = req.body;

  // Clear old session if provided
  if (sessionId) {
    maitriService.clearSession(sessionId);
  }

  // Generate new session ID
  const newSessionId = uuidv4();

  res.json({
    sessionId: newSessionId,
    message: 'New session started successfully',
  });
});

/**
 * GET /api/chat/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MAITRI Chat API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
