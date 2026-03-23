import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./GroundingExercise.module.css";

const steps = [
  {
    count: 5,
    instruction: "Things you can SEE",
    description: "Look around you and name five objects in your environment.",
    icon: "👁️",
  },
  {
    count: 4,
    instruction: "Things you can FEEL",
    description: "Pay attention to your body and name four things you can feel (e.g., your feet on the floor, the texture of your clothes).",
    icon: "✋",
  },
  {
    count: 3,
    instruction: "Things you can HEAR",
    description: "Listen closely and name three distinct sounds you can hear (e.g., a clock ticking, distant traffic).",
    icon: "👂",
  },
  {
    count: 2,
    instruction: "Things you can SMELL",
    description: "Notice any scents in the air and name two things you can smell.",
    icon: "👃",
  },
  {
    count: 1,
    instruction: "Thing you can TASTE",
    description: "Focus on your mouth and name one thing you can taste, or your favorite taste.",
    icon: "👅",
  },
];

export default function GroundingExercise() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Audio state
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});
  const activeSourceRef = useRef(null);

  // Initialize Audio Context and Preload Audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        const buffers = {};

        // Fetch audio for all 5 steps
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const textToSpeak = `${step.count} ${step.instruction}. ${step.description}`;
          const res = await fetch(`http://localhost:5000/api/chat/tts?text=${encodeURIComponent(textToSpeak)}`);
          if (!res.ok) throw new Error("TTS fetch failed");
          const arrayBuffer = await res.arrayBuffer();
          const decodedData = await audioContextRef.current.decodeAudioData(arrayBuffer);
          buffers[i] = decodedData;
        }

        audioBuffersRef.current = buffers;
        setAudioLoaded(true);
      } catch (err) {
        console.error("Failed to load grounding instruction audio:", err);
        // Continue even if audio fails (visual-only mode)
        setAudioLoaded(true);
      }
    };

    initAudio();

    return () => {
      if (activeSourceRef.current) {
        activeSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playVoice = useCallback((stepIndex) => {
    // Stop any existing playback
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
    }

    const ctx = audioContextRef.current;
    const buffer = audioBuffersRef.current[stepIndex];
    if (ctx && buffer) {
      if (ctx.state === "suspended") ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      activeSourceRef.current = source;
    }
  }, []);

  const handleStart = async () => {
    if (!audioLoaded) return;
    
    // Resume audio context inside user gesture
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
    setIsStarted(true);
    playVoice(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      playVoice(next);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      playVoice(prev);
    }
  };

  const reset = () => {
    setIsStarted(false);
    setCurrentStep(0);
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
    }
  };

  const step = steps[currentStep];

  // Auto-advance logic
  useEffect(() => {
    let timeout;
    if (isStarted && currentStep < steps.length - 1) {
      timeout = setTimeout(() => {
        nextStep();
      }, 7000);
    }
    return () => clearTimeout(timeout);
  }, [isStarted, currentStep]);

  if (!isStarted) {
    return (
      <div className={styles.viewContainer}>
        <div className={styles.startCard}>
          <div className={styles.startIcon}>🧘</div>
          <h2 className={styles.title}>5-4-3-2-1 Grounding</h2>
          <p className={styles.description}>
            Reconnect with your surroundings during moments of stress. Follow the guided voice instructions to ease your mind.
          </p>
          <button 
            className={styles.startBtn} 
            onClick={handleStart}
            disabled={!audioLoaded}
          >
            {!audioLoaded ? "Loading Voices..." : "Start Exercise"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.stepCard}>
        {/* Animated Timer Bar representing the 7 seconds */}
        {currentStep < steps.length - 1 && (
          <div className={styles.timerTrack}>
             <div className={styles.timerFill} key={`timer-${currentStep}`}></div>
          </div>
        )}

        <div className={styles.badgeWrapper}>
          <div className={styles.groundingBadge}>{step.count}</div>
          <div className={styles.groundingIcon}>{step.icon}</div>
        </div>
        
        <h2 className={styles.stepTitle}>{step.instruction}</h2>
        <p className={styles.stepDesc}>{step.description}</p>
        
        <div className={styles.controlsRow}>
          <button 
            className={styles.navBtn} 
            onClick={prevStep} 
            disabled={currentStep === 0}
          >
            Previous
          </button>
          {currentStep < steps.length - 1 ? (
            <button className={styles.navBtn} onClick={nextStep}>
              Next
            </button>
          ) : (
            <button className={styles.navBtnAction} onClick={reset}>
              Restart
            </button>
          )}
        </div>

        <div className={styles.dotsProgress}>
          {steps.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${index === currentStep ? styles.dotActive : index < currentStep ? styles.dotCompleted : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
