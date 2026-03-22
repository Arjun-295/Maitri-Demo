import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ChatPage.css";
import ReactMarkdown from "react-markdown";
import {
  loadModels,
  detectEmotion,
  areModelsLoaded,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
  getEmotionDisplayName,
} from "../services/faceApiService";

const moduleThemes = {
  default: {
    accent: '#00ffff',
    glow: 'rgba(0, 255, 255, 0.3)',
  },
  cbt_core: {
    accent: '#00ffff',
    glow: 'rgba(0, 255, 255, 0.3)',
  },
  dbt_skill: {
    accent: '#ff00ff',
    glow: 'rgba(255, 0, 255, 0.3)',
  },
  act_integration: {
    accent: '#00ff00',
    glow: 'rgba(0, 255, 0, 0.3)',
  },
  psychoeducation: {
    accent: '#ffff00',
    glow: 'rgba(255, 255, 0, 0.3)',
  }
};

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

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMessage = location.state?.message || "";
  const moduleType = location.state?.moduleType || "default";
  const pageTitle = location.state?.title || "Maitri Chat";

  const [messages, setMessages] = useState([]);
  const theme = moduleThemes[moduleType] || moduleThemes.default;
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  // Emotion detection state
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(false);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initialMessageProcessed = useRef(false);
  const detectionIntervalRef = useRef(null);

  // Handler for navigating back
  const handleBack = () => {
    // Stop camera and detection before going back
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    navigate("/");
  };

  /**
   * Send a message to the MAITRI backend API
   * @param {string} message - The message to send
   * @returns {Promise<{response: string, sessionId: string}>}
   */
  const sendMessageToAPI = async (message, emotion = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
          emotion: emotion || detectedEmotion,
          moduleType: moduleType,
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

  // Initialize camera and emotion detection
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

    // Load face-api models
    const initModels = async () => {
      setIsModelLoading(true);
      try {
        const loaded = await loadModels();
        if (!loaded) {
          setModelError(true);
        }
      } catch (err) {
        console.error("Model loading error:", err);
        setModelError(true);
      } finally {
        setIsModelLoading(false);
      }
    };

    startCamera();
    initModels();

    // Cleanup camera and detection on unmount
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Start emotion detection when models and camera are ready
  useEffect(() => {
    if (!isModelLoading && !modelError && cameraStream && videoRef.current) {
      // Run detection every 500ms
      detectionIntervalRef.current = setInterval(async () => {
        if (areModelsLoaded() && videoRef.current) {
          const result = await detectEmotion(videoRef.current);
          if (result) {
            setDetectedEmotion(result.emotion);
            setEmotionConfidence(result.confidence);
          }
        }
      }, 500);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isModelLoading, modelError, cameraStream]);

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

  return (
    <div className="chat-page-container" style={{ background: `radial-gradient(circle at 50% 10%, ${theme.accent}20, transparent 70%), #050508` }}>
      {/* Header with back button */}
      <div className="chat-page-header" style={{ borderBottomColor: theme.accent + '40', boxShadow: `0 4px 15px ${theme.accent}10` }}>
        <button className="back-button" onClick={handleBack} style={{ color: theme.accent }}>
          <BackIcon />
          <span>Back</span>
        </button>
        <h1 className="chat-page-title" style={{ color: theme.accent, textShadow: `0 0 10px ${theme.accent}60` }}>{pageTitle}</h1>
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
              {isModelLoading ? (
                <div className="emotion-badge loading">
                  <span className="emotion-icon">⏳</span>
                  <span className="emotion-text">Loading AI...</span>
                </div>
              ) : modelError ? (
                <div className="emotion-badge error">
                  <span className="emotion-icon">⚠️</span>
                  <span className="emotion-text">Detection Error</span>
                </div>
              ) : detectedEmotion ? (
                <div
                  className="emotion-badge detected"
                  style={{
                    backgroundColor: EMOTION_COLORS[detectedEmotion] + "20",
                    borderColor: EMOTION_COLORS[detectedEmotion],
                  }}
                >
                  <span className="emotion-icon">
                    {EMOTION_EMOJIS[detectedEmotion]}
                  </span>
                  <span
                    className="emotion-text"
                    style={{ color: EMOTION_COLORS[detectedEmotion] }}
                  >
                    {getEmotionDisplayName(detectedEmotion)}
                  </span>
                  <span className="emotion-confidence">
                    {Math.round(emotionConfidence * 100)}%
                  </span>
                </div>
              ) : (
                <div className="emotion-badge">
                  <span className="emotion-icon">👤</span>
                  <span className="emotion-text">Detecting...</span>
                </div>
              )}
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
                      <div className="message-bubble" style={msg.sender === "bot" ? { borderLeft: `3px solid ${theme.accent}`, background: `${theme.accent}05` } : {}}>
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
