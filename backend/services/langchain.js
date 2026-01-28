import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

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

  // Simple array-based chat history
  const chatHistory = [];

  const addToHistory = (userText, aiResponse) => {
    chatHistory.push(new HumanMessage(userText));
    chatHistory.push(new AIMessage(aiResponse));
  };

  const getHistory = () => chatHistory;

  return { llm, createPrompt, addToHistory, getHistory };
}
