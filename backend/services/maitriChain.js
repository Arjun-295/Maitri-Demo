/**
 * MAITRI LangChain Service
 *
 * This module sets up the LangChain integration with Google Gemini API
 * for the MAITRI AI assistant. It handles conversation memory and
 * generates responses based on the MAITRI persona.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import config from "../config/index.js";
import { MAITRI_SYSTEM_PROMPT } from "../prompts/maitriSystemPrompt.js";

/**
 * In-memory storage for conversation histories by session ID
 * In production, this should be replaced with a database solution
 */
const conversationMemories = new Map();

/**
 * Maximum number of messages to keep in conversation history
 * to prevent context window overflow
 */
const MAX_HISTORY_LENGTH = 20;

/**
 * Initialize the Google Gemini chat model
 */
const model = new ChatGoogleGenerativeAI({
  apiKey: config.googleApiKey,
  model: "gemini-3-flash-preview",
  temperature: 0.7, // Balanced between creativity and consistency
  // maxOutputTokens: 500,
  // Keep responses concise
});

/**
 * Create the chat prompt template with system message and conversation history
 */
const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", MAITRI_SYSTEM_PROMPT],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

/**
 * Get or create conversation history for a session
 * @param {string} sessionId - Unique session identifier
 * @returns {Array} - Array of message objects
 */
function getConversationHistory(sessionId) {
  if (!conversationMemories.has(sessionId)) {
    conversationMemories.set(sessionId, []);
  }
  return conversationMemories.get(sessionId);
}

/**
 * Add messages to conversation history
 * @param {string} sessionId - Unique session identifier
 * @param {string} humanMessage - User's message
 * @param {string} aiMessage - AI's response
 */
function addToHistory(sessionId, humanMessage, aiMessage) {
  const history = getConversationHistory(sessionId);

  history.push(new HumanMessage(humanMessage));
  history.push(new AIMessage(aiMessage));

  // Trim history if it exceeds max length
  while (history.length > MAX_HISTORY_LENGTH * 2) {
    history.shift(); // Remove oldest messages
    history.shift();
  }
}

/**
 * Clear conversation history for a session
 * @param {string} sessionId - Unique session identifier
 */
export function clearSession(sessionId) {
  conversationMemories.delete(sessionId);
}

/**
 * Process a chat message and generate a response
 * @param {string} sessionId - Unique session identifier
 * @param {string} userMessage - The user's message
 * @returns {Promise<{response: string, sessionId: string}>}
 */
export async function chat(sessionId, userMessage) {
  try {
    const history = getConversationHistory(sessionId);

    // Format the prompt with history and current input
    const formattedPrompt = await chatPrompt.formatMessages({
      history: history,
      input: userMessage,
    });

    // Generate response from the model
    const response = await model.invoke(formattedPrompt);

    // Extract the response text
    const responseText = response.content;

    // Add to conversation history
    addToHistory(sessionId, userMessage, responseText);

    return {
      response: responseText,
      sessionId: sessionId,
    };
  } catch (error) {
    console.error("Error in MAITRI chat service:", error);
    throw error;
  }
}

/**
 * Get session statistics (for debugging/monitoring)
 * @param {string} sessionId - Unique session identifier
 * @returns {Object} - Session statistics
 */
export function getSessionStats(sessionId) {
  const history = getConversationHistory(sessionId);
  return {
    sessionId,
    messageCount: history.length,
    exists: conversationMemories.has(sessionId),
  };
}

export default {
  chat,
  clearSession,
  getSessionStats,
};
