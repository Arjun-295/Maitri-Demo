import React, { useState } from 'react';
import './GlassNav.css'; // Import styles for this component

// SVG icons for the buttons
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.6 11.6L22 7v10l-6.4-4.6v-0.8zM4 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
  </svg>
);

const VoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);


export default function GlassNav({ activeButton, setActiveButton }) {

    return (
      <div className="glass-nav-container">
        <button 
          className={`nav-button ${activeButton === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveButton('chat')}
        >
          <ChatIcon />
          <span>Chat</span>
        </button>
        <button 
          className={`nav-button ${activeButton === 'video' ? 'active' : ''}`}
          onClick={() => setActiveButton('video')}
        >
          <VideoIcon />
          <span>Video Call</span>
        </button>
        <button 
          className={`nav-button ${activeButton === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveButton('voice')}
        >
          <VoiceIcon />
          <span>Voice</span>
        </button>
      </div>
    );
  }
