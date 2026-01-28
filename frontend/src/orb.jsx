import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

// Custom hook for microphone input
function useMicrophone() {
  const [frequency, setFrequency] = useState(0);
  const analyserRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const getMicData = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const avgFrequency =
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setFrequency(avgFrequency);
      }
      animationFrameId = requestAnimationFrame(getMicData);
    };

    const setupMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        getMicData();
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    setupMic();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return frequency;
}

function HolographicGlobe({ voiceFrequency }) {
  const meshRef = useRef();
  const atmosphereRef = useRef();

  // Base rotation speed
  const baseRotation = 0.002;

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate the globe
      meshRef.current.rotation.y += baseRotation + voiceFrequency * 0.0001;

      // Pulse effect based on voice
      const targetScale = 1 + voiceFrequency / 200;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += baseRotation * 0.8;
      // Atmosphere pulses slightly differently
      const atmoScale = 1.2 + voiceFrequency / 300;
      atmosphereRef.current.scale.lerp(
        new THREE.Vector3(atmoScale, atmoScale, atmoScale),
        0.1,
      );
    }
  });

  return (
    <group>
      {/* Wireframe Core */}
      <Sphere ref={meshRef} args={[1.0, 32, 32]}>
        <meshBasicMaterial
          color="#00aaff"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Point Cloud Layer for "High Tech" feel */}
      <points>
        <sphereGeometry args={[1.05, 64, 64]} />
        <pointsMaterial color="#00ffff" size={0.02} transparent opacity={0.4} />
      </points>

      {/* Glowing Atmosphere */}
      <Sphere ref={atmosphereRef} args={[1.2, 32, 32]}>
        <meshStandardMaterial
          color="#0044ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}

export default function Orb() {
  const voiceFrequency = useMicrophone();

  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#00aaff" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#ff00aa" intensity={0.5} />

      <HolographicGlobe voiceFrequency={voiceFrequency} />

      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </Canvas>
  );
}
