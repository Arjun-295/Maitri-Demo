import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Page Imports
import Home from "./pages/Home";
import VoicePage from "./pages/VoicePage";
import ChatPage from "./pages/ChatPage";
import Exercises from "./pages/Exercises";
import BreathingTimer from "./components/Exercises/BreathingTimer";
import GroundingExercise from "./components/Exercises/GroundingExercise";
import AmbientSounds from "./components/Exercises/AmbientSounds";
import CBT from "./components/Exercises/CBT";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voice" element={<VoicePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/exercises" element={<Exercises />}>
          <Route path="cbt" element={<CBT />} />
          <Route path="breathing" element={<BreathingTimer />} />
          <Route path="grounding" element={<GroundingExercise />} />
          <Route path="ambient" element={<AmbientSounds />} />
        </Route>
      </Routes>
    </Router>
  );
}
