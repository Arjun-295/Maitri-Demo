import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

// Import local components and the hook
import Particles from './Particles';
import PulsatingSphere from './PulsatingSphere';
import useMicrophone from '../../hooks/useMicrophone';

// This component now contains all the 3D scene logic
function SceneContent() {
  const analyserRef = useMicrophone();

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#00aaff" intensity={5} />

      {/* Pass the analyserRef to the components that need it */}
      <PulsatingSphere analyserRef={analyserRef} />
      <Particles analyserRef={analyserRef} />
    </>
  );
}

export default function Orb() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <SceneContent />
    </Canvas>
  );
}