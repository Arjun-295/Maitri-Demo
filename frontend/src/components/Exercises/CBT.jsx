import React from "react";
import { Link } from "react-router-dom";

const modules = [
  {
    id: "cbt_core",
    title: "CBT Core Module",
    description: "Structured tools for cognitive restructuring (thought records, thinking traps) and behavioral activation.",
    icon: "🧠",
    color: "#00ffff"
  },
  {
    id: "dbt_skill",
    title: "DBT Skill Suite",
    description: "Interactive modules for emotion regulation, distress tolerance, and interpersonal effectiveness.",
    icon: "🌊",
    color: "#ff00ff"
  },
  {
    id: "act_integration",
    title: "ACT Integration",
    description: "Exercises focused on acceptance and mindfulness to manage stress without avoidance.",
    icon: "🌿",
    color: "#00ff00"
  },
  {
    id: "psychoeducation",
    title: "Clinical Psychoeducation",
    description: "Learn about coping strategies and mental health literacy interactively.",
    icon: "📚",
    color: "#ffff00"
  }
];

export default function CBT() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 p-8 w-full max-w-[1200px] mx-auto">
      {modules.map((mod) => (
        <Link 
          key={mod.id} 
          to={`/chat/${mod.id}`} 
          state={{ message: `I'd like to start with the ${mod.title}.` }}
          className="flex flex-col items-center text-center p-10 bg-[#141923]/40 backdrop-blur-md rounded-3xl border border-white/10 cursor-pointer transition-all duration-400 text-white relative overflow-hidden hover:-translate-y-1 hover:border-[var(--card-color)] hover:shadow-[0_0_25px_var(--card-color)] group decoration-none"
          style={{ '--card-color': mod.color }}
        >
          {/* Background Radial Glow Effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--card-color)_0%,transparent_70%)] opacity-0 transition-opacity duration-400 group-hover:opacity-15 z-0" />
          
          <div className="text-[3.5rem] mb-6 filter drop-shadow-[0_0_10px_var(--card-color)] z-10" style={{ color: mod.color }}>{mod.icon}</div>
          <h3 className="m-0 mb-4 text-2xl font-bold font-['Rajdhani'] z-10" style={{ color: mod.color }}>{mod.title}</h3>
          <p className="m-0 text-sm opacity-70 leading-relaxed z-10 text-white/80">{mod.description}</p>
        </Link>
      ))}
    </div>
  );
}
