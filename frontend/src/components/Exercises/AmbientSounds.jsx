import React, { useState, useRef, useEffect } from "react";
import styles from "./AmbientSounds.module.css";

const soundscapes = [
  {
    id: "deep-space",
    name: "Deep Space Hum",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder
    icon: "🏮",
  },
  {
    id: "cosmic-rain",
    name: "Cosmic Rain",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", // Placeholder
    icon: "🌧️",
  },
  {
    id: "solfeggio",
    name: "528Hz DNA Repair",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", // Placeholder
    icon: "🎵",
  },
];

export default function AmbientSounds() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(soundscapes[0]);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(new Audio(soundscapes[0].url));

  useEffect(() => {
    audioRef.current.loop = true;
    return () => {
      audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const selectSound = (sound) => {
    const wasPlaying = isPlaying;
    audioRef.current.pause();
    audioRef.current = new Audio(sound.url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    setCurrentSound(sound);
    if (wasPlaying) {
      audioRef.current.play();
    }
  };

  return (
    <div className={`${styles.ambientContainer} glass`}>
      <div className={styles.currentSoundInfo}>
        <div className={styles.ambientIconLarge}>{currentSound.icon}</div>
        <h2>{currentSound.name}</h2>
        <p>{isPlaying ? "Currently Playing" : "Paused"}</p>
      </div>

      <div className={styles.ambientControls}>
        <button className={`${styles.playToggle} glass`} onClick={togglePlay}>
          {isPlaying ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <div className={styles.volumeControl}>
          <span>🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
          <span>🔊</span>
        </div>
      </div>

      <div className={styles.soundscapeList}>
        {soundscapes.map((sound) => (
          <div
            key={sound.id}
            className={`${styles.soundscapeItem} glass ${currentSound.id === sound.id ? styles.active : ""}`}
            onClick={() => selectSound(sound)}
          >
            <span>{sound.icon}</span>
            <span>{sound.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
