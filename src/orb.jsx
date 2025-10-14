import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Custom hook for microphone input (no changes here)
function useMicrophone() {
  const [frequency, setFrequency] = useState(0);
  const analyserRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const getMicData = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const avgFrequency = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setFrequency(avgFrequency);
      }
      animationFrameId = requestAnimationFrame(getMicData);
    };

    const setupMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        getMicData();
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    setupMic();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return frequency;
}

// Particle component
function Particles({ count = 2000, voiceFrequency }) {
  const pointsRef = useRef();
  
  // Generate random positions for the particles
  const positions = useMemo(() => {
    const p = new Array(count).fill(0).map((v) => {
      // Create particles in a spherical volume around the orb
      const r = 3 + Math.random() * 5; // Radius from 3 to 8 units
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      return [x, y, z];
    });
    return new Float32Array(p.flat());
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Animate particles to subtly swirl and react to voice
      const t = clock.getElapsedTime() * 0.1;
      pointsRef.current.rotation.x = t * 0.5;
      pointsRef.current.rotation.y = t * 0.8;

      // Adjust particle size or intensity based on voice
      const pulseEffect = 0.5 + voiceFrequency / 100; // Adjust intensity based on voice
      if (pointsRef.current.material) {
        pointsRef.current.material.size = 0.05 * pulseEffect;
        pointsRef.current.material.opacity = 0.7 * pulseEffect;
      }
    }
  });

  return (
    <Points positions={positions} ref={pointsRef}>
      <PointMaterial
        transparent
        color="#00ffff" // Particle color
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

function PulsatingSphere({ voiceFrequency }) {
  const meshRef = useRef();
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00ffff',
    emissive: '#00ffff',
    emissiveIntensity: 0.5,
    toneMapped: false
  }), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const basePulse = Math.sin(time * 1.5) * 0.1 + 0.9;
    
    const targetScale = 1 + (voiceFrequency / 150);
    const currentScale = meshRef.current.scale.x;
    const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);

    const finalScale = basePulse * lerpedScale;
    meshRef.current.scale.set(finalScale, finalScale, finalScale);

    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0.5 + voiceFrequency / 40, 0.1);
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 32, 32]} material={material} />
  );
}

export default function Orb() {
  const voiceFrequency = useMicrophone();

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} color="#00aaff" intensity={2} />
      <PulsatingSphere voiceFrequency={voiceFrequency} />
      {/* Add the Particles component here */}
      <Particles voiceFrequency={voiceFrequency} />
    </Canvas>
  );
}