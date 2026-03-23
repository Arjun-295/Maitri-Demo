import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./BreathingTimer.module.css";

const PHASES = [
  { id: "inhale", label: "Inhale", duration: 4, command: "Inhale" },
  { id: "hold_in", label: "Hold", duration: 4, command: "Hold" },
  { id: "exhale", label: "Exhale", duration: 4, command: "Exhale" },
  { id: "hold_out", label: "Hold", duration: 4, command: "Hold" },
];

export default function BreathingTimer() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration);
  
  // Overall session timer
  const [selectedDuration, setSelectedDuration] = useState(60); // in seconds, default 1 min
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(60);

  // Audio state
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});
  const timerRef = useRef(null);

  // Initialize Audio Context and Preload Audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        const wordsToFetch = ["Inhale", "Hold", "Exhale"];
        const buffers = {};

        for (const word of wordsToFetch) {
          const res = await fetch(`http://localhost:5000/api/chat/tts?text=${word}`);
          if (!res.ok) throw new Error("TTS fetch failed");
          const arrayBuffer = await res.arrayBuffer();
          const decodedData = await audioContextRef.current.decodeAudioData(arrayBuffer);
          buffers[word] = decodedData;
        }

        audioBuffersRef.current = buffers;
        setAudioLoaded(true);
      } catch (err) {
        console.error("Failed to load breathing instruction audio:", err);
        // Continue even if audio fails (visual-only mode)
        setAudioLoaded(true);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      clearInterval(timerRef.current);
    };
  }, []);

  const playVoice = useCallback((command) => {
    const ctx = audioContextRef.current;
    const buffer = audioBuffersRef.current[command];
    if (ctx && buffer) {
      if (ctx.state === "suspended") ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  }, []);

  // Main Breathing Loop Execution
  const triggerPhase = useCallback((index) => {
    const phase = PHASES[index];
    setPhaseIndex(index);
    setSecondsLeft(phase.duration);
    
    // Play voice immediately
    playVoice(phase.command);
  }, [playVoice]);

  // Handle session completion
  useEffect(() => {
    if (isActive && sessionSecondsLeft <= 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      setPhaseIndex(0);
      setSecondsLeft(PHASES[0].duration);
      setSessionSecondsLeft(selectedDuration);
    }
  }, [isActive, sessionSecondsLeft, selectedDuration]);

  useEffect(() => {
    if (isActive) {
      // Setup main countdown interval
      timerRef.current = setInterval(() => {
        setSessionSecondsLeft((prev) => Math.max(0, prev - 1));

        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // End of current phase, move to next
            const nextIndex = (phaseIndex + 1) % PHASES.length;
            triggerPhase(nextIndex);
            return PHASES[nextIndex].duration; // Prevent going negative while states update
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, phaseIndex, triggerPhase]);

  const handleToggle = async () => {
    if (!audioLoaded) return;
    
    // Resume audio context inside user gesture
    if (!isActive && audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (!isActive) {
      // Starting fresh cycle if we were stopped
      if (phaseIndex === 0 && secondsLeft === PHASES[0].duration && sessionSecondsLeft === selectedDuration) {
        triggerPhase(0);
      }
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].duration);
    setSessionSecondsLeft(selectedDuration);
  };

  const currentPhase = PHASES[phaseIndex];
  // Determine scale for animation mapping
  let circleScaleStyle = { transform: 'scale(1)' };
  if (currentPhase.id === "inhale" || currentPhase.id === "hold_in") {
    circleScaleStyle = { transform: 'scale(1.5)' }; // Expand / keep expanded
  } else if (currentPhase.id === "exhale" || currentPhase.id === "hold_out") {
    circleScaleStyle = { transform: 'scale(1)' };   // Shrink / keep shrunk
  }

  return (
    <div className={styles.container}>
      {/* Visual Animation Area */}
      <div className={styles.visualizerArea}>
        <div 
          className={`${styles.breathingCircle} ${isActive ? styles.animated : ""}`}
          style={isActive ? circleScaleStyle : { transform: 'scale(1)' }}
        >
          <div className={styles.breathingText}>
            <h2>{currentPhase.label}</h2>
            <p>{secondsLeft}</p>
          </div>
        </div>
      </div>

      {/* Main Controls Area */}
      <div className={styles.controlsArea}>
        <p className={styles.instructionText}>
          Box breathing (4-4-4-4) helps calm the nervous system.
        </p>

        {!isActive && sessionSecondsLeft === selectedDuration && (
          <div className={styles.durationSelector}>
            <label>Session Duration: </label>
            <select 
              value={selectedDuration} 
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedDuration(val);
                setSessionSecondsLeft(val);
              }}
              className={styles.durationSelect}
            >
              <option value={60}>1 Minute</option>
              <option value={180}>3 Minutes</option>
              <option value={300}>5 Minutes</option>
            </select>
          </div>
        )}

        { (isActive || sessionSecondsLeft < selectedDuration) && (
          <div className={styles.sessionTimer}>
            Time Remaining: {Math.floor(sessionSecondsLeft / 60)}:{(sessionSecondsLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.controlButton} ${isActive ? styles.btnPause : styles.btnStart}`} 
            onClick={handleToggle}
            disabled={!audioLoaded}
          >
            {!audioLoaded ? "Loading Voices..." : isActive ? "Pause" : "Start Box Breathing"}
          </button>
          
          <button 
            className={`${styles.controlButton} ${styles.btnReset}`} 
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
