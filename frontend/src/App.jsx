import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Page Imports
import Home from "./pages/Home";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
