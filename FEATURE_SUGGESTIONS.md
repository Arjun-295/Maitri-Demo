# MAITRI — Feature Suggestions & Improvement Roadmap

> A comprehensive list of improvements and new features for MAITRI, organized by priority.

---

## 🔴 Critical Improvements (Fix First)

| Area                 | Issue                                                                                                      | Suggestion                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Data Persistence** | Chat history is **in-memory only** (`Map()` in `maitriChain.js`) — all conversations lost on restart       | Add **MongoDB** or **SQLite** for persistent session storage |
| **No Auth**          | No user authentication — anyone can access the API                                                         | Add basic JWT auth or session-based login                    |
| **Hardcoded Model**  | Model is hardcoded as `"gemini-3-flash-preview"` in `maitriChain.js` despite `config.geminiModel` existing | Use `config.geminiModel` instead of the hardcoded string     |
| **Leftover Files**   | `recording.pcm`, `out.wav`, `Corrected.jsx`, `Test.jsx` are dev artifacts left in the repo                 | Clean up or `.gitignore` them                                |

---

## 🟡 High-Impact Feature Additions

### 1. 😊 Emotion Detection via Webcam _(already planned)_

- Use **TensorFlow.js** + **face-api.js** in the browser to detect facial expressions in real-time
- Send detected emotion alongside chat messages (the `chat()` function already accepts an `emotion` parameter)
- The AI prompt already handles emotion context — just needs the frontend piece

### 2. 📊 Mood Tracking Dashboard

- Log detected emotions and self-reported mood over time
- Display trends with **Recharts** or **Chart.js** (e.g., mood line graph over days)
- Show weekly/monthly emotional summaries
- Correlate mood with sleep patterns, exercise, etc.

### 3. 🧘 Guided Exercises Module

The system prompt mentions breathing exercises and grounding techniques, but they're text-only. Add:

- **Interactive breathing timer** with animated visuals (inhale/hold/exhale circles)
- **Guided meditation player** with ambient space sounds
- **5-4-3-2-1 grounding exercise** as a step-by-step interactive UI
- **Progressive muscle relaxation** with body-part animations

### 4. 📓 Journal / Diary Feature

- Let astronauts write private journal entries
- AI can optionally analyze entries for emotional patterns
- "Gratitude log" aligned with the therapeutic techniques in the prompt
- Option to share entries with ground-based psychologists

### 5. 🔔 Scheduled Check-ins & Notifications

- Daily emotional check-in reminders (e.g., "How are you feeling today?")
- **Circadian rhythm tracker** — a real problem in space
- Sleep quality logging + suggestions
- Customizable notification schedule

---

## 🟢 Nice-to-Have Enhancements

### 6. 🌐 Offline / PWA Support

- Make it a **Progressive Web App** with service workers
- Cache static assets and previous conversations
- Use a local LLM fallback (e.g., **Ollama** with a small model) when disconnected

### 7. 🎨 UI/UX Improvements

- **Dark/Light theme toggle** (extend the existing glassmorphism)
- **Typing indicator** when AI is generating a response
- **Message reactions** (helpful/not helpful) for AI response feedback
- **Chat search** to find past conversations
- **Onboarding flow** for first-time users explaining MAITRI's capabilities

### 8. 🔊 Voice Mode Enhancements

- **Voice activity detection (VAD)** — auto-detect when user starts/stops speaking
- **Interrupt support** — allow user to interrupt the AI mid-response
- **Multiple TTS voice options** (different Deepgram voices)
- **Transcription display** — show real-time text during voice mode

### 9. 🚨 Emergency Protocol System

- **SOS button** that immediately connects to mission control (simulated)
- **Panic attack mode** — simplified UI with large text, calming colors, guided breathing
- **Crew alert system** — notify other crew members if distress is detected

### 10. 📱 Responsive & Multi-platform

- Ensure the app is fully **responsive** for tablets (space station tablets)
- Add **keyboard shortcuts** for hands-free interaction
- **Wearable integration** concept (heart rate data from smartwatch → emotion context)

---

## 🏗️ Technical / Architecture Improvements

| Area                 | Current                  | Suggested                                                              |
| -------------------- | ------------------------ | ---------------------------------------------------------------------- |
| **Database**         | In-memory `Map()`        | MongoDB Atlas / SQLite / PostgreSQL                                    |
| **State Management** | Component-level state    | Use **Zustand** globally (already installed)                           |
| **Testing**          | None                     | Add **Vitest** for frontend, **Jest + Supertest** for backend          |
| **API Docs**         | None                     | Add **Swagger/OpenAPI** for `/api/chat` endpoints                      |
| **Deployment**       | Localhost only           | Frontend → **Vercel**, Backend → **Render** or **Railway**             |
| **Environment**      | Single `.env`            | Add `.env.example` with placeholder keys for contributors              |
| **Streaming**        | Full response at once    | Use **Server-Sent Events (SSE)** to stream AI responses token-by-token |
| **Rate Limiting**    | Voice only (2s cooldown) | Add **express-rate-limit** for the HTTP chat API too                   |
| **Logging**          | `console.log`            | Use **Winston** or **Pino** for structured logging                     |

---

## 🚀 Top 5 Recommended Priorities

1. **Webcam Emotion Detection** — Backend already supports it, just needs the frontend
2. **Database Persistence** — Critical for any real usage
3. **Mood Tracking Dashboard** — Strong visual feature for demos/presentations
4. **Interactive Guided Exercises** — Differentiates MAITRI from a generic chatbot
5. **Streaming Responses (SSE)** — Makes the chat feel much more responsive
