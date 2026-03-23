import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export function createMaitriChain() {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // Factory function to create a prompt from a system prompt string
  const createPrompt = (systemPrompt) => {
    return ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{text}"],
    ]);
  };

  // Simple array-based chat history for fallback
  const chatHistory = [];

  const loadHistory = async (conversationId) => {
    if (!conversationId || conversationId.length < 24) return chatHistory;
    try {
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(40);
      
      const chronological = messages.reverse();
      return chronological.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.text) : new AIMessage(msg.text)
      );
    } catch (e) {
      return chatHistory;
    }
  };

  const saveAndAddToHistory = async (conversationId, userText, aiResponse) => {
    // Save to fallback memory
    chatHistory.push(new HumanMessage(userText));
    chatHistory.push(new AIMessage(aiResponse));

    // Save to DB
    if (conversationId && conversationId.length >= 24) {
      try {
        await Message.create({ conversationId, role: 'user', text: userText });
        await Message.create({ conversationId, role: 'assistant', text: aiResponse });

        // Title Gen
        const conv = await Conversation.findById(conversationId);
        if (conv && (conv.title === "New Conversation" || conv.title === "New Chat")) {
           const res = await llm.invoke(`Task: Generate a 3-5 word concise title for this user message: "${userText}". Output just the title without quotes.`);
           conv.title = res.content.trim().replace(/["']/g, "");
           await conv.save();
        }
      } catch (err) {}
    }
  };

  const getHistory = () => chatHistory;

  return { llm, createPrompt, saveAndAddToHistory, loadHistory, getHistory };
}
