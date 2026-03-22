import React, { useState } from 'react'; // Import styles for this component

// SVG icons for the buttons
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);


const VoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

export default function GlassNav({ activeButton, setActiveButton, hideItems = [] }) {

    return (
      <div className="flex justify-center items-center p-4 gap-4 fixed bottom-8 left-1/2 -translate-x-1/2 z-20 bg-[#141928]/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-auto">
        {!hideItems.includes('chat') && (
          <button 
            className={`flex items-center gap-2 bg-transparent border-none text-white/70 px-6 py-3 rounded-full font-['Rajdhani'] text-xl font-medium cursor-pointer transition-all duration-300 relative ${activeButton === 'chat' ? 'text-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'hover:bg-white/10 hover:text-white'}`}
            onClick={() => setActiveButton('chat')}
          >
            <ChatIcon />
            <span>Chat</span>
          </button>
        )}
        {!hideItems.includes('voice') && (
          <button 
            className={`flex items-center gap-2 bg-transparent border-none text-white/70 px-6 py-3 rounded-full font-['Rajdhani'] text-xl font-medium cursor-pointer transition-all duration-300 relative ${activeButton === 'voice' ? 'text-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'hover:bg-white/10 hover:text-white'}`}
            onClick={() => setActiveButton('voice')}
          >
            <VoiceIcon />
            <span>Voice</span>
          </button>
        )}
      </div>
    );
  }
