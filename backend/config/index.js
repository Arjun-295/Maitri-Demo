/**
 * Configuration module for MAITRI backend
 * Loads environment variables and exports configuration object
 */

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Google Gemini API configuration
  googleApiKey: process.env.GOOGLE_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ],
};

// Validate required configuration
if (!config.googleApiKey) {
  console.error(
    "❌ ERROR: GOOGLE_API_KEY is required. Please set it in your .env file.",
  );
  console.error(
    "   Get your API key from: https://aistudio.google.com/app/apikey",
  );
  process.exit(1);
}

export default config;
