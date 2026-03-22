import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Orb from "../orb";
import "./VoicePage.css";

// Icons
const PlayIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const StopIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <rect x="4" y="4" width="16" height="16" rx="2"></rect>
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

export default function VoicePage() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready");
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

  // Handler for navigating back
  const handleBack = () => {
    stopVoiceAgent();
    navigate("/");
  };

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

  // Start Voice Agent
  const startVoiceAgent = () => {
    if (isRunning) return;

    setStatus("Connecting...");
    const ws = new WebSocket("ws://localhost:5000/ws/voice");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WS Connected");
      setIsConnected(true);
      setIsRunning(true);
      initAudio();
    };

    ws.onmessage = async (event) => {
      const data = event.data;

      if (data instanceof Blob) {
        const arrayBuffer = await data.arrayBuffer();
        audioQueueRef.current.push(arrayBuffer);
        playNextChunk();
      } else {
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
      setIsRunning(false);
      setStatus("Disconnected");
    };

    ws.onerror = () => {
      setStatus("Connection Error");
      setIsRunning(false);
    };
  };

  // Stop Voice Agent
  const stopVoiceAgent = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setIsRunning(false);
    setStatus("Ready");
    setOrbFrequency(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceAgent();
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

  return (
    <div className="voice-page-container">
      <div className="voice-page-header">
        <button className="back-button" onClick={handleBack}>
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
          {!isRunning ? (
            <button className="control-button start" onClick={startVoiceAgent}>
              <PlayIcon />
            </button>
          ) : (
            <button className="control-button stop" onClick={stopVoiceAgent}>
              <StopIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
