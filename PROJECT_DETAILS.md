# MAITRI - Project Details

> Mental and Adaptive Intelligence for Therapeutic Response and Integration

---

## 🔹 1. Project Basics

|                   |                      |
| ----------------- | -------------------- |
| **Project Title** | MAITRI               |
| **Type**          | Major / Hackathon    |
| **Duration**      | ~2-3 weeks (ongoing) |
| **Team**          | Solo                 |

---

## 🔹 2. Problem Statement

Astronauts on space missions face unique psychological challenges—isolation, stress, circadian disruptions, and being far from loved ones—with limited access to mental health professionals. MAITRI provides an AI-powered companion that offers real-time emotional support and therapeutic guidance to astronauts aboard the Bhartiya Antariksh Station.

---

## 🔹 3. Your Role

**Full Stack Developer** – Built both the frontend React interface with 3D visualizations and the backend Express server with real-time voice streaming support.

---

## 🔹 4. Tech Stack

| Category              | Technologies                                                                  |
| --------------------- | ----------------------------------------------------------------------------- |
| **Frontend**          | React 19, Vite, React Router DOM, React Three Fiber, Three.js, React Markdown |
| **Backend**           | Node.js, Express.js, WebSocket (ws)                                           |
| **Database**          | N/A (Session-based in-memory chat history)                                    |
| **AI / ML**           | Google Gemini 2.5 Flash (via LangChain), Deepgram (Speech-to-Text & TTS)      |
| **Tools & Libraries** | LangChain, @react-three/drei, @react-three/postprocessing, CORS, dotenv       |

---

## 🔹 5. Key Features

1. **AI Chat Interface** – Text-based conversation with MAITRI AI for emotional support with Markdown rendering
2. **Real-time Voice Mode** – WebSocket-based bidirectional voice communication with STT and TTS
3. **3D Interactive Orb Visualization** – Audio-reactive 3D orb using Three.js that responds to voice input
4. **Emotion Detection (Planned)** – Camera integration for facial emotion detection (under development)
5. **Evidence-Based Therapeutic Techniques** – AI provides grounding, breathing exercises, and mindfulness guidance
6. **Critical Issue Detection** – Recognizes signs of severe distress and recommends escalation to mission control

---

## 🔹 6. Logic / Architecture

| Component        | Description                                                                           |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Architecture** | REST API + WebSocket (Hybrid)                                                         |
| **Frontend**     | React SPA with glassmorphism UI, 3D components via React Three Fiber                  |
| **Backend**      | Express server with HTTP API endpoints (`/api/chat`) and WebSocket path (`/ws/voice`) |
| **AI Pipeline**  | LangChain → Google Gemini (Prompt templating + Chat history) → StringOutputParser     |
| **Voice Flow**   | Browser → WebSocket → Deepgram STT → Gemini AI → Deepgram TTS → Browser playback      |

---

## 🔹 7. Results / Outcomes

- ✅ Fully functional bidirectional voice conversation with AI
- ✅ Real-time speech-to-text using Deepgram Nova-2 model
- ✅ AI-generated TTS responses for natural conversation flow
- ✅ Responsive 3D orb visualization reacting to audio input
- ✅ Session-based chat history for context-aware conversations

---

## 🔹 8. Deployment / Demo

|                 |                                                    |
| --------------- | -------------------------------------------------- |
| **Hosted**      | No (Localhost only)                                |
| **Platform**    | Local development (Vite frontend, Node.js backend) |
| **Ports**       | Frontend: `5173`, Backend: `5000`                  |
| **GitHub Link** | _(Add your repository link here)_                  |

---

## 🔹 9. Why This Project Matters

- 🚀 **Space Healthcare Innovation** – Addresses a critical gap in astronaut well-being support during long-duration missions
- 🧠 **Mental Health AI** – Combines conversational AI with therapeutic techniques for psychological support
- 🎯 **Real-time Interaction** – Voice-first design mimics natural conversation, crucial in hands-free environments
- 🇮🇳 **ISRO Alignment** – Designed specifically for ISRO's Bhartiya Antariksh Station initiative
- 🌐 **Offline Capability Potential** – Designed with awareness of space station connectivity limitations
