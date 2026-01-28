import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";
import ReactMarkdown from "react-markdown";

// API Base URL for MAITRI backend
const API_BASE_URL = "http://localhost:5000/api";

// Back arrow icon
const BackIcon = () => (
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
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

// Send icon for chat
const SendIcon = () => (
  <svg
    width="20"
    height="20"
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

// Loading dots animation component
const LoadingDots = () => (
  <div className="loading-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

export default function ChatPage({ initialMessage, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initialMessageProcessed = useRef(false);

  /**
   * Send a message to the MAITRI backend API
   * @param {string} message - The message to send
   * @returns {Promise<{response: string, sessionId: string}>}
   */
  const sendMessageToAPI = async (message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to get response from MAITRI",
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  /**
   * Add a message to the messages array
   */
  const addMessage = (text, sender, isError = false) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, sender, timestamp: new Date(), isError },
    ]);
  };

  /**
   * Process a user message and get AI response
   */
  const processMessage = async (userMessage) => {
    addMessage(userMessage, "user");
    setIsLoading(true);

    try {
      const result = await sendMessageToAPI(userMessage);

      // Update session ID if returned
      if (result.sessionId) {
        setSessionId(result.sessionId);
      }

      addMessage(result.response, "bot");
    } catch (error) {
      addMessage(
        "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🛠️",
        "bot",
        true,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize with the first message if provided
  useEffect(() => {
    if (
      initialMessage &&
      initialMessage.trim() &&
      !initialMessageProcessed.current
    ) {
      initialMessageProcessed.current = true;
      processMessage(initialMessage);
    }
  }, [initialMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    // Cleanup camera on unmount
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const message = inputValue.trim();
      setInputValue("");
      processMessage(message);
    }
  };

  const handleBack = () => {
    // Stop camera before going back
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    onBack();
  };

  return (
    <div className="chat-page-container">
      {/* Header with back button */}
      <div className="chat-page-header">
        <button className="back-button" onClick={handleBack}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1 className="chat-page-title">Maitri Chat</h1>
      </div>

      {/* Main content area */}
      <div className="chat-page-content">
        {/* Left side - Camera view */}
        <div className="camera-section">
          <div className="camera-box glass-effect">
            <div className="camera-feed">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
            </div>
            <div className="emotion-overlay">
              <div className="emotion-badge">
                <span className="emotion-icon">🔬</span>
                <span className="emotion-text">Emotion Detection</span>
              </div>
              <p className="under-development"></p>
            </div>
          </div>
        </div>

        {/* Right side - Chat box */}
        <div className="chat-section">
          <div className="chat-box glass-effect">
            {/* Messages area */}
            <div className="messages-container">
              {messages.length === 0 && !isLoading ? (
                <div className="empty-chat">
                  <p>Start a conversation with Maitri</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}${msg.isError ? " error-message" : ""}`}
                    >
                      <div className="message-bubble">
                        <div className="message-text">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="message bot-message">
                      <div className="message-bubble loading-bubble">
                        <LoadingDots />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form className="chat-input-form" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-message-input"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                className={`chat-send-button${isLoading ? " disabled" : ""}`}
                disabled={isLoading}
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
