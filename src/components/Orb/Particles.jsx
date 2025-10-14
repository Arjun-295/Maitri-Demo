import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function Particles({ count = 2500, analyserRef }) {
  const pointsRef = useRef();
  const dataArray = useMemo(() => analyserRef.current ? new Uint8Array(analyserRef.current.frequencyBinCount) : null, [analyserRef]);

  const positions = useMemo(() => {
    const p = new Array(count).fill(0).map(() => {
      const r = 4 + Math.random() * 3;
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
      const t = clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = t;
      pointsRef.current.rotation.y = t * 1.2;

      if (analyserRef.current && dataArray) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const avgFrequency = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const targetSize = 0.035 + avgFrequency / 5000;
        if (pointsRef.current.material.size) {
          pointsRef.current.material.size = THREE.MathUtils.lerp(pointsRef.current.material.size, targetSize, 0.1);
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