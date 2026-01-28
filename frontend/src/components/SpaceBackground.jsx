import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const SpaceBackground = () => {
  const particlesInit = async (main) => {
    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    await loadFull(main);
  };

  const particlesLoaded = (container) => {
    // optional callback after particles are loaded
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        fullScreen: { enable: true, zIndex: -1 }, // makes it full screen behind your content
        background: {
          color: {
            value: "#0d0d0d", // deep space color
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
            resize: true,
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 4 },
          },
        },
        particles: {
          color: { value: "#ffffff" },
          links: { enable: false },
          collisions: { enable: false },
          move: {
            direction: "none",
            enable: true,
            outModes: "bounce",
            random: true,
            speed: 0.2,
            straight: false,
          },
          number: { density: { enable: true, area: 800 }, value: 150 },
          opacity: { value: 0.8 },
          shape: { type: "circle" },
          size: { value: { min: 0.5, max: 2 } },
        },
        detectRetina: true,
      }}
    />
  );
};

export default SpaceBackground;
