import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function PulsatingSphere({ analyserRef }) {
  const meshRef = useRef();
  const dataArray = useMemo(() => analyserRef.current ? new Uint8Array(analyserRef.current.frequencyBinCount) : null, [analyserRef]);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00ffff',
    emissive: '#00ffff',
    emissiveIntensity: 0.5,
    toneMapped: false,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
  }), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    let voiceFrequency = 0;

    if (analyserRef.current && dataArray) {
      analyserRef.current.getByteFrequencyData(dataArray);
      voiceFrequency = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    }

    const basePulse = Math.sin(time * 1.5) * 0.05 + 0.95;
    const targetScale = 1 + (voiceFrequency / 150);
    const currentScale = meshRef.current.scale.x;
    const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.2);
    const finalScale = basePulse * lerpedScale;

    meshRef.current.scale.set(finalScale, finalScale, finalScale);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0.5 + voiceFrequency / 30, 0.2);
  });

  return (
    <Sphere ref={meshRef} args={[2.5, 32, 32]} material={material} />
  );
}