import React, { useState } from "react";
import "./ChatInput.css";

// SVG icon for the send button
const SendIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    if (message.trim()) {
      console.log("Sending message:", message); // Placeholder for actual chat logic
      setMessage(""); // Clear the input field
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSend}>
      <input
        type="text"
        className="chat-input"
        placeholder="Ask VYOM anything..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="send-button">
        <SendIcon />
      </button>
    </form>
  );
}
