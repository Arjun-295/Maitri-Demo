import React, { useState, useEffect, useRef, useCallback } from "react";
import Orb from "../Orb/Orb";
import "./VoicePage.css";

// Icons
const MicIcon = () => (
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
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

const MicOffIcon = () => (
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
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

const PhoneOffIcon = () => (
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
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
    <line x1="23" y1="1" x2="1" y2="23"></line>
  </svg>
);

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

export default function VoicePage({ onBack }) {
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [isConnected, setIsConnected] = useState(false);
  const [orbFrequency, setOrbFrequency] = useState(0); // Frequency driver for Orb

  // Refs
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const analyserRef = useRef(null);

  // Initialize Audio Context
  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )({ sampleRate: 16000 });

      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Analyser for visualization (Orb)
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Processor for capturing audio to send
      await audioContextRef.current.audioWorklet
        .addModule("/worklets/audio-processor.js")
        .catch(async () => {
          // Fallback to ScriptProcessor if Worklet fails or file missing (common in dev without buildup)
          // simplified inline fallback logic or just standard approach below
          console.log(
            "Worklet not found, using ScriptProcessor fallback logic in logic flow if needed, but here we use standard processor",
          );
        });

      // Simple ScriptProcessor for now as it's easier to drop in without external files
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1,
      );

      processor.onaudioprocess = (e) => {
        if (
          isMuted ||
          !socketRef.current ||
          socketRef.current.readyState !== WebSocket.OPEN
        )
          return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Downsample or convert to PCM16 if needed, but Deepgram accepts linear16
        // We'll send raw float32 or convert to 16-bit PCM
        const pcmData = convertFloat32ToInt16(inputData);
        socketRef.current.send(pcmData);

        // Also drive Orb with mic input when user speaks
        updateOrbFromAnalyser();
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination); // Mute self? usually we don't connect to destination to avoid feedback
      // Actually, don't connect to destination if you don't want hear yourself
      // processor.connect(audioContextRef.current.destination);

      processorRef.current = processor;
      setStatus("Listening");

      // Start animation loop for Orb
      drawLoop();
    } catch (err) {
      console.error("Audio init error:", err);
      setStatus("Error: No Mic Access");
    }
  };

  const convertFloat32ToInt16 = (buffer) => {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, Math.max(-1, buffer[l])) * 0x7fff;
    }
    return buf.buffer;
  };

  const updateOrbFromAnalyser = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    setOrbFrequency(avg); // Scale this as needed in Orb
  };

  // Animation loop to keep getting frequency data
  const drawLoop = () => {
    requestAnimationFrame(drawLoop);
    updateOrbFromAnalyser();
  };

  // Connect WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws/voice"); // Make sure port matches
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WS Connected");
      setIsConnected(true);
      initAudio();
    };

    ws.onmessage = async (event) => {
      const data = event.data;

      if (data instanceof Blob) {
        // Audio chunk from server
        const arrayBuffer = await data.arrayBuffer();
        audioQueueRef.current.push(arrayBuffer);
        playNextChunk();
      } else {
        // JSON message
        try {
          const msg = JSON.parse(data);
          if (msg.type === "tts_end") {
            // Handle end of speech if needed
          }
        } catch (e) {}
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setStatus("Disconnected");
    };

    return () => {
      ws.close();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playNextChunk = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    setStatus("Speaking...");

    const chunk = audioQueueRef.current.shift();

    try {
      // We need a separate context or reuse existing one to decode
      // Note: decodeAudioData might fail on partial chunks if not properly formatted (e.g. mp3 frames)
      // Since we are receiving raw PCM or complete MP3? Deepgram 'speak' returns complete MP3 in our backend implementation currently.
      // Wait, backend deepgram `streamTTS` gets the WHOLE file.
      // So `chunk` is a full MP3 file.

      const audioBuffer = await audioContextRef.current.decodeAudioData(chunk);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      // Connect to analyser too so Orb dances to AI voice!
      if (analyserRef.current) {
        source.connect(analyserRef.current);
      }

      source.onended = () => {
        isPlayingRef.current = false;
        setStatus("Listening");
        playNextChunk();
      };

      source.start(0);
    } catch (e) {
      console.error("Error playing chunk", e);
      isPlayingRef.current = false;
      playNextChunk();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="voice-page-container">
      <div className="voice-page-header">
        <button className="back-button" onClick={onBack}>
          <BackIcon />
          <span>Exit Voice Mode</span>
        </button>
        <div className="connection-status">
          <div className={`status-dot ${isConnected ? "connected" : ""}`}></div>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div className="voice-page-content">
        {/* Orb visualization in the background */}
        <div
          className={`orb-container ${status === "Speaking..." || orbFrequency > 10 ? "pulsating" : ""}`}
        >
          <Orb voiceFrequency={orbFrequency} />
        </div>

        <div className="status-indicator">
          <span className="status-text">{status}</span>
        </div>

        <div className="voice-controls">
          <button
            className={`control-button mute ${isMuted ? "active" : ""}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </button>
          <button className="control-button end-call" onClick={onBack}>
            <PhoneOffIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
