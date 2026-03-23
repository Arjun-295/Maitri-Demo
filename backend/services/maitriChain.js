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
import { 
  CBT_CORE_PROMPT, 
  DBT_SKILL_PROMPT, 
  ACT_INTEGRATION_PROMPT, 
  PSYCHOEDUCATION_PROMPT 
} from "../prompts/cbtPrompts.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

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
 * Prompt templates dictionary for different therapeutic modules
 */
const promptTemplates = {
  default: ChatPromptTemplate.fromMessages([
    ["system", MAITRI_SYSTEM_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]),
  cbt_core: ChatPromptTemplate.fromMessages([
    ["system", CBT_CORE_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]),
  dbt_skill: ChatPromptTemplate.fromMessages([
    ["system", DBT_SKILL_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]),
  act_integration: ChatPromptTemplate.fromMessages([
    ["system", ACT_INTEGRATION_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]),
  psychoeducation: ChatPromptTemplate.fromMessages([
    ["system", PSYCHOEDUCATION_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]),
};

/**
 * Get conversation history from Database
 * @param {string} conversationId - Unique session identifier
 * @returns {Promise<Array>} - Array of message objects
 */
async function getConversationHistory(conversationId) {
  if (!conversationId || conversationId.length < 24) return [];
  
  try {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY_LENGTH * 2);
    
    // Reverse to chronological order
    const chronological = messages.reverse();

    return chronological.map(msg => 
      msg.role === 'user' ? new HumanMessage(msg.text) : new AIMessage(msg.text)
    );
  } catch (err) {
    console.error("Error loading chat history from DB", err);
    return [];
  }
}

/**
 * Automatically update conversation title on first message
 */
async function generateTitleIfEmpty(conversationId, userMessage) {
  if (!conversationId || conversationId.length < 24) return;
  
  try {
    const conv = await Conversation.findById(conversationId);
    if (conv && (conv.title === "New Conversation" || conv.title === "New Chat")) {
       const res = await model.invoke(`Task: Generate a 3-5 word concise title for this user message: "${userMessage}". Output just the title without quotes.`);
       conv.title = res.content.trim().replace(/["']/g, "");
       await conv.save();
    }
  } catch (err) {
    console.error("Error generating title:", err);
  }
}

/**
 * Clear conversation history for a session
 * @param {string} sessionId - Unique session identifier
 */
export async function clearSession(sessionId) {
  try {
    await Message.deleteMany({ conversationId: sessionId });
  } catch (err) {}
}

/**
 * Process a chat message and generate a response
 * @param {string} sessionId - Unique session identifier
 * @param {string} userMessage - The user's message
 * @param {string} emotion - Optional detected user emotion
 * @param {string} moduleType - Optional module identifier (default, cbt_core, etc.)
 * @returns {Promise<{response: string, sessionId: string}>}
 */
export async function chat(sessionId, userMessage, emotion = null, moduleType = "default") {
  try {
    const history = await getConversationHistory(sessionId);

    // Get the correct prompt template based on moduleType
    const selectedTemplate = promptTemplates[moduleType] || promptTemplates.default;

    // Format the prompt with history and current input
    let enhancedInput = userMessage;
    if (emotion && emotion !== "neutral") {
      const emotionContext = `[User's facial expression suggests they are feeling ${emotion}. Please acknowledge and respond empathetically to their emotional state while addressing their message.]\n\n`;
      enhancedInput = emotionContext + userMessage;
    }

    const formattedPrompt = await selectedTemplate.formatMessages({
      history: history,
      input: enhancedInput,
    });

    // Generate response from the model
    const response = await model.invoke(formattedPrompt);

    // Extract the response text
    const responseText = response.content;

    // Save to Database
    if (sessionId && sessionId.length >= 24) {
      await Message.create({ conversationId: sessionId, role: 'user', text: userMessage });
      await Message.create({ conversationId: sessionId, role: 'assistant', text: responseText });
      
      // Fire title generator in background
      generateTitleIfEmpty(sessionId, userMessage).catch(() => {});
    }

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
export async function getSessionStats(sessionId) {
  try {
     const count = await Message.countDocuments({ conversationId: sessionId });
     return {
       sessionId,
       messageCount: count,
       exists: count > 0,
     };
  } catch (e) {
     return { sessionId, messageCount: 0, exists: false };
  }
}

export default {
  chat,
  clearSession,
  getSessionStats,
};
