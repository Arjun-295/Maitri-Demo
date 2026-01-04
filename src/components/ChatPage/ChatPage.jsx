import React, { useState, useEffect, useRef } from "react";
import "./ChatPage.css";

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

export default function ChatPage({ initialMessage, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize with the first message if provided
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      addMessage(initialMessage, "user");
      // Simulate response after a short delay
      setTimeout(() => {
        addMessage("Under Development 🚧", "bot");
      }, 500);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const addMessage = (text, sender) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, sender, timestamp: new Date() },
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addMessage(inputValue, "user");
      setInputValue("");
      // Simulate bot response
      setTimeout(() => {
        addMessage("Under Development 🚧", "bot");
      }, 500);
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
              <p className="under-development">Under Development</p>
            </div>
          </div>
        </div>

        {/* Right side - Chat box */}
        <div className="chat-section">
          <div className="chat-box glass-effect">
            {/* Messages area */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <p>Start a conversation with Maitri</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
                  >
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))
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
              <button type="submit" className="chat-send-button">
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
