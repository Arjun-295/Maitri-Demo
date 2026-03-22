import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Component Imports
import GlassNav from "../components/GlassNav";
import ChatInput from "../components/ChatInput";
import Orb from "../orb";

// Stylesheet
// Tailwind CSS loaded globally from index.css

export default function Home() {
  const navigate = useNavigate();
  // State for tracking microphone permission errors
  const [permissionError, setPermissionError] = useState(false);

  // State to manage which mode is active (chat, video, or voice)
  // 'chat' is the default active mode on home page now.
  const [activeButton, setActiveButton] = useState("chat");

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
    navigate("/chat", { state: { message } });
  };

  // Handle mode button clicks - navigate to routes for voice
  const handleModeChange = (mode) => {
    if (mode === "voice") {
      navigate("/voice");
    } else if (mode === "exercises") {
      navigate("/exercises");
    } else {
      setActiveButton(mode);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black text-[#00ffff]">
      {/* Floating Navigation */}
      <div className="absolute top-6 left-6 z-30 flex gap-4">
        <button 
          className="flex items-center gap-2 bg-[#141928]/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-white font-medium text-lg cursor-pointer hover:bg-white/10 hover:text-[#00ffff] hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 shadow-md decoration-none" 
          onClick={() => navigate('/exercises')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12a4 4 0 1 1 8 0 4 4 0 1 1-8 0"></path>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
          <span>Exercises</span>
        </button>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center">
        <h1 className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-[clamp(2rem,8vw,5rem)] font-medium tracking-[0.5rem] uppercase m-0 animate-flicker">
          Welcome to Maitri
        </h1>
        <div className="absolute top-0 left-0 w-full h-full z-0">
          {permissionError && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center text-center p-8 z-50">
              <h2>
                Microphone access is required for Maitri to listen. Please
                enable it in your browser settings.
              </h2>
            </div>
          )}
          <Orb />
        </div>
      </div>

      {activeButton === "chat" && <ChatInput onNavigate={handleChatNavigate} />}

      {/* The main navigation bar - updated to use routing */}
      <GlassNav
        activeButton={activeButton}
        setActiveButton={handleModeChange}
      />
    </div>
  );
}
