import React, { useState, useEffect } from 'react';

// Component Imports
import Orb from './components/Orb';
import GlassNav from './components/GlassNav';
import ChatInput from './components/ChatInput';

// Stylesheet
import './App.css';

export default function App() {
  // State for tracking microphone permission errors
  const [permissionError, setPermissionError] = useState(false);

  // State to manage which mode is active (chat, video, or voice)
  // 'voice' is the default active mode.
  const [activeButton, setActiveButton] = useState('voice');

  // Effect to check for microphone permissions on component mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' }).then(result => {
        if (result.state === 'denied') {
          setPermissionError(true);
        }
        // Listen for any changes in permission status
        result.onchange = () => {
          setPermissionError(result.state === 'denied');
        }
      });
    }
  }, []);

  return (
    <div className="app-container">
      <h1 className="title">MAITRI</h1>
      
      {/* Wrapper for the 3D canvas */}
      <div className="canvas-wrapper">
        {permissionError && (
          <div className="mic-permission-overlay">
            <h2>Microphone access is required for MAITRI to listen. Please enable it in your browser settings.</h2>
          </div>
        )}
        <Orb />
      </div>

      {/* Conditionally render the ChatInput only when 'chat' mode is active */}
      {activeButton === 'chat' && <ChatInput />}

      {/* The main navigation bar. It receives the state and the function to update it. */}
      <GlassNav 
        activeButton={activeButton} 
        setActiveButton={setActiveButton} 
      />
    </div>
  );
}
