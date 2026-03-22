import React, { useState, useEffect } from "react";
import styles from "./BreathingTimer.module.css";

export default function BreathingTimer() {
  const [phase, setPhase] = useState("Inhale"); // Inhale, Hold, Exhale, Hold
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      switch (phase) {
        case "Inhale":
          setPhase("Hold");
          setSeconds(4);
          break;
        case "Hold":
          if (seconds === 0 && phase === "Hold") {
            // Logic for first hold vs second hold if needed, but for box breathing it's same
            setPhase("Exhale");
            setSeconds(4);
          }
          break;
        case "Exhale":
          setPhase("Rest");
          setSeconds(4);
          break;
        case "Rest":
          setPhase("Inhale");
          setSeconds(4);
          break;
        default:
          setPhase("Inhale");
          setSeconds(4);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, phase]);

  const toggleTimer = () => setIsActive(!isActive);

  return (
    <div className={`${styles.breathingContainer} glass`}>
      <div
        className={`${styles.breathingCircle} ${styles[phase.toLowerCase()] || ""} ${isActive ? styles.active : ""}`}
      >
        <div className={styles.breathingText}>
          <h2>{phase === "Rest" ? "Hold" : phase}</h2>
          <p>{seconds}</p>
        </div>
      </div>
      <div className={styles.breathingControls}>
        <button className={`${styles.controlButton} glass`} onClick={toggleTimer}>
          {isActive ? "Pause" : "Start Box Breathing"}
        </button>
      </div>
      <p className={styles.breathingInstruction}>
        Box breathing (4-4-4-4) helps calm the nervous system.
      </p>
    </div>
  );
}
