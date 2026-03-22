import React, { useState } from "react";
import styles from "./GroundingExercise.module.css";

const steps = [
  {
    count: 5,
    instruction: "Things you can SEE",
    description: "Look around you and name five objects in your environment.",
    icon: "👁️",
  },
  {
    count: 4,
    instruction: "Things you can FEEL",
    description: "Pay attention to your body and name four things you can feel (e.g., your feet on the floor, the texture of your clothes).",
    icon: "✋",
  },
  {
    count: 3,
    instruction: "Things you can HEAR",
    description: "Listen closely and name three distinct sounds you can hear (e.g., a clock ticking, distant traffic).",
    icon: "👂",
  },
  {
    count: 2,
    instruction: "Things you can SMELL",
    description: "Notice any scents in the air and name two things you can smell.",
    icon: "👃",
  },
  {
    count: 1,
    instruction: "Thing you can TASTE",
    description: "Focus on your mouth and name one thing you can taste, or your favorite taste.",
    icon: "👅",
  },
];

export default function GroundingExercise() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => setCurrentStep(0);

  const step = steps[currentStep];

  return (
    <div className={`${styles.groundingContainer} glass`}>
      <div className={styles.groundingStep}>
        <div className={styles.groundingBadge}>{step.count}</div>
        <div className={styles.groundingIcon}>{step.icon}</div>
        <h2>{step.instruction}</h2>
        <p>{step.description}</p>
      </div>

      <div className={styles.groundingControls}>
        <button 
          className={`${styles.navButtonSimple} glass`} 
          onClick={prevStep} 
          disabled={currentStep === 0}
        >
          Previous
        </button>
        {currentStep < steps.length - 1 ? (
          <button className={`${styles.navButtonSimple} glass`} onClick={nextStep}>
            Next
          </button>
        ) : (
          <button className={`${styles.navButtonSimple} glass`} onClick={reset}>
            Restart
          </button>
        )}
      </div>

      <div className={styles.groundingProgress}>
        {steps.map((_, index) => (
          <div
            key={index}
            className={`${styles.progressDot} ${index === currentStep ? styles.active : ""}`}
          ></div>
        ))}
      </div>
    </div>
  );
}
