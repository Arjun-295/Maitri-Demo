import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
// 1. Import Stars from drei
import { Sphere, Points, PointMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

// --- 3D Orb & Particles Components ---

// Custom hook for microphone input
// This hook now returns a stable ref to the audio analyser
function useMicrophone() {
  const analyserRef = useRef(null);

  useEffect(() => {
    let audioContext;
    let stream;

    const setupMic = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    setupMic();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, []);

  return analyserRef;
}

// Particle component
function Particles({ count = 2500, analyserRef }) {
  const pointsRef = useRef();
  // Memoize the data array to avoid creating it on every frame
  const dataArray = useMemo(
    () =>
      analyserRef.current
        ? new Uint8Array(analyserRef.current.frequencyBinCount)
        : null,
    [analyserRef]
  );

  const positions = useMemo(() => {
    const p = new Array(count).fill(0).map(() => {
      const r = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      return [x, y, z];
    });
    return new Float32Array(p.flat());
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = t;
      pointsRef.current.rotation.y = t * 1.2;

      // Make particles react to voice by reading from the analyserRef
      if (analyserRef.current && dataArray) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const avgFrequency =
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const targetSize = 0.035 + avgFrequency / 5000;
        if (pointsRef.current.material.size) {
          pointsRef.current.material.size = THREE.MathUtils.lerp(
            pointsRef.current.material.size,
            targetSize,
            0.1
          );
        }
      }
    }
  });

  return (
    <Points positions={positions} ref={pointsRef}>
      <PointMaterial
        transparent
        color="#00ffff"
        size={0.035}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

// Central pulsating sphere component
function PulsatingSphere({ analyserRef }) {
  const meshRef = useRef();
  const dataArray = useMemo(
    () =>
      analyserRef.current
        ? new Uint8Array(analyserRef.current.frequencyBinCount)
        : null,
    [analyserRef]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#00ffff",
        emissive: "#00ffff",
        emissiveIntensity: 0.5,
        toneMapped: false,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    let voiceFrequency = 0;

    if (analyserRef.current && dataArray) {
      analyserRef.current.getByteFrequencyData(dataArray);
      voiceFrequency =
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    }

    const basePulse = Math.sin(time * 1.5) * 0.05 + 0.95;
    const targetScale = 1 + voiceFrequency / 150;
    const currentScale = meshRef.current.scale.x;
    const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.2);
    const finalScale = basePulse * lerpedScale;

    meshRef.current.scale.set(finalScale, finalScale, finalScale);
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      0.5 + voiceFrequency / 30,
      0.2
    );
  });

  return <Sphere ref={meshRef} args={[2.5, 32, 32]} material={material} />;
}

// Component to contain the 3D scene and microphone logic
function SceneContent() {
  const analyserRef = useMicrophone();

  return (
    <>
      {/* 2. Add the Stars component for the space background 🌌 */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#00aaff" intensity={5} />
      <PulsatingSphere analyserRef={analyserRef} />
      <Particles analyserRef={analyserRef} />
    </>
  );
}

// 3D Scene component wrapper
function Orb() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <SceneContent />
    </Canvas>
  );
}

// --- Main App Component ---

export default function App() {
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    // Check for microphone permission and update state if denied
    if (navigator.permissions) {
      navigator.permissions.query({ name: "microphone" }).then((result) => {
        if (result.state === "denied") {
          setPermissionError(true);
        }
        result.onchange = () => {
          setPermissionError(result.state === "denied");
        };
      });
    }
  }, []);

  const FullScreenUIStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&display=swap');

    .app-container {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Rajdhani', sans-serif;
      /* 3. Changed background from a URL to solid black */
      background: #000;
      color: #00ffff;
      position: relative;
    }
    
    .title {
      position: absolute;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      font-size: clamp(2rem, 8vw, 5rem);
      font-weight: 500;
      letter-spacing: 0.5rem;
      text-transform: uppercase;
      margin: 0;
      text-shadow: 0 0 5px #00ffff, 0 0 15px #00ffff, 0 0 30px #00ffff;
      animation: flicker 3s infinite alternate;
    }

    .canvas-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    
    @keyframes flicker {
      0%, 18%, 22%, 25%, 53%, 57%, 100% {
        text-shadow:
        0 0 4px #00ffff,
        0 0 11px #00ffff,
        0 0 19px #00ffff,
        0 0 40px #0fa,
        0 0 80px #0fa;
      }
      20%, 24%, 55% {       
        text-shadow: none;
      }
    }

    .mic-permission-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
      z-index: 100;
    }
  `;

  return (
    <>
      <style>{FullScreenUIStyles}</style>
      <div className="app-container">
        <h1 className="title">VYOM</h1>
        <div className="canvas-wrapper">
          {permissionError && (
            <div className="mic-permission-overlay">
              <h2>
                Microphone access is required for VYOM to listen. Please enable
                it in your browser settings.
              </h2>
            </div>
          )}
          <Orb />
        </div>
      </div>
    </>
  );
}
