import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function GlowingOrb({ emotion = "calm", volume = 0 }) {
  const meshRef = useRef();
  const ringRef = useRef();

  // Emotion colors
  const colors = {
    calm: "#00faff",    // cyan
    happy: "#39ff14",   // neon green
    tired: "#9d4edd",   // purple
    stressed: "#ff003c" // red
  };

  const glowColor = colors[emotion] || "#00faff";

  // Animate orb pulse based on volume
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const basePulse = Math.sin(t * 2) * 0.05; // idle breathing
    const audioPulse = volume * 0.5; // scale from mic
    const scale = 1 + basePulse + audioPulse;

    meshRef.current.scale.setScalar(scale);
    ringRef.current.rotation.z = t * 0.3; // ring rotation
  });

  return (
    <>
      {/* Core Orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          emissive={new THREE.Color(glowColor)}
          emissiveIntensity={2}
          color={glowColor}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Rotating Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshStandardMaterial
          emissive={new THREE.Color(glowColor)}
          emissiveIntensity={1.5}
          color={glowColor}
          transparent
          opacity={0.6}
        />
      </mesh>
    </>
  );
}

export default function OrbCore({ emotion }) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    let audioContext, analyser, dataArray, source;

    async function initMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        function getVolume() {
          analyser.getByteFrequencyData(dataArray);
          let values = 0;
          for (let i = 0; i < bufferLength; i++) {
            values += dataArray[i];
          }
          const average = values / bufferLength / 256; // normalize
          setVolume(average);
          requestAnimationFrame(getVolume);
        }

        getVolume();
      } catch (err) {
        console.error("Mic access denied:", err);
      }
    }

    initMic();

    return () => {
      if (audioContext) audioContext.close();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <pointLight intensity={2} position={[5, 5, 5]} />

        {/* Orb (with live audio volume) */}
        <GlowingOrb emotion={emotion} volume={volume} />

        {/* Bloom effect */}
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} intensity={2} />
        </EffectComposer>

        {/* Orbit controls for testing */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
