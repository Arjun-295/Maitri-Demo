/**
 * Face-API Service for Emotion Detection
 *
 * This service handles loading face-api.js models and detecting
 * facial expressions from video elements in real-time.
 */

import * as faceapi from "face-api.js";

// Model loading state
let modelsLoaded = false;
let loadingPromise = null;

// Emotion emoji mapping
export const EMOTION_EMOJIS = {
  neutral: "😐",
  happy: "😊",
  sad: "😢",
  angry: "😠",
  fearful: "😨",
  disgusted: "🤢",
  surprised: "😲",
};

// Emotion color mapping
export const EMOTION_COLORS = {
  neutral: "#9ca3af", // Gray
  happy: "#22c55e", // Green
  sad: "#3b82f6", // Blue
  angry: "#ef4444", // Red
  fearful: "#a855f7", // Purple
  disgusted: "#a16207", // Brown
  surprised: "#eab308", // Yellow
};

/**
 * Load the face-api.js models
 * @returns {Promise<boolean>} - Whether models loaded successfully
 */
export async function loadModels() {
  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Return true if already loaded
  if (modelsLoaded) {
    return true;
  }

  loadingPromise = (async () => {
    try {
      const MODEL_URL = "/models";

      // Load the lightweight face detector and expression model
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded = true;
      console.log("Face-api models loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading face-api models:", error);
      loadingPromise = null;
      return false;
    }
  })();

  return loadingPromise;
}

/**
 * Check if models are loaded
 * @returns {boolean}
 */
export function areModelsLoaded() {
  return modelsLoaded;
}

/**
 * Detect emotions from a video element
 * @param {HTMLVideoElement} videoElement - The video element to analyze
 * @returns {Promise<{emotion: string, confidence: number, allEmotions: Object} | null>}
 */
export async function detectEmotion(videoElement) {
  if (!modelsLoaded) {
    console.warn("Models not loaded yet");
    return null;
  }

  if (!videoElement || videoElement.readyState < 2) {
    return null;
  }

  try {
    // Detect face with expressions
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection) {
      return null;
    }

    // Get the expressions object
    const expressions = detection.expressions;

    // Find the dominant emotion
    let maxEmotion = "neutral";
    let maxConfidence = 0;

    for (const [emotion, confidence] of Object.entries(expressions)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        maxEmotion = emotion;
      }
    }

    return {
      emotion: maxEmotion,
      confidence: maxConfidence,
      allEmotions: expressions,
    };
  } catch (error) {
    console.error("Error detecting emotion:", error);
    return null;
  }
}

/**
 * Get display name for an emotion
 * @param {string} emotion - The emotion key
 * @returns {string} - Capitalized emotion name
 */
export function getEmotionDisplayName(emotion) {
  if (!emotion) return "Unknown";
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
}

export default {
  loadModels,
  areModelsLoaded,
  detectEmotion,
  getEmotionDisplayName,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
};
