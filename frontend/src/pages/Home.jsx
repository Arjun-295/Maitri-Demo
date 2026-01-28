import React, { useState, useEffect } from "react";

// Component Imports
import GlassNav from "../components/GlassNav";
import ChatInput from "../components/ChatInput";
import ChatPage from "../components/ChatPage";
import VoicePage from "../components/VoicePage/VoicePage";
import Orb from "../orb";

// Stylesheet
import "../App.css";

export default function Home() {
  // State for tracking microphone permission errors
  const [permissionError, setPermissionError] = useState(false);

  // State to manage which mode is active (chat, video, or voice)
  // 'voice' is the default active mode.
  const [activeButton, setActiveButton] = useState("voice");

  // State for chat page navigation
  const [showChatPage, setShowChatPage] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  // Effect to check for microphone permissions on component mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "microphone" }).then((result) => {
        if (result.state === "denied") {
          setPermissionError(true);
        }
        // Listen for any changes in permission status
        result.onchange = () => {
          setPermissionError(result.state === "denied");
        };
      });
    }
  }, []);

  // Handle navigation to chat page
  const handleChatNavigate = (message) => {
    setInitialMessage(message);
    setShowChatPage(true);
  };

  // Handle going back from chat page
  const handleBackFromChat = () => {
    setShowChatPage(false);
    setInitialMessage("");
  };

  // Render chat page if active
  return (
    <div className="app-container">
      {/* Conditionally render content based on active mode */}
      {showChatPage ? (
        <ChatPage initialMessage={initialMessage} onBack={handleBackFromChat} />
      ) : activeButton === "voice" ? (
        <VoicePage onBack={() => setActiveButton("chat")} />
      ) : (
        <>
          <div className="home-content">
            <h1 className="title">Welcome to Maitri</h1>
            {/* Placeholder for Home content when not in Voice mode */}
            <div className="canvas-wrapper">
              {permissionError && (
                <div className="mic-permission-overlay">
                  <h2>
                    Microphone access is required for Maitri to listen. Please
                    enable it in your browser settings.
                  </h2>
                </div>
              )}
              <Orb />
            </div>
          </div>
          {/* Conditionally render the ChatInput only when 'chat' mode is active */}
          {activeButton === "chat" && (
            <ChatInput onNavigate={handleChatNavigate} />
          )}

          {/* The main navigation bar. */}
          <GlassNav
            activeButton={activeButton}
            setActiveButton={setActiveButton}
          />
        </>
      )}
    </div>
  );
}
