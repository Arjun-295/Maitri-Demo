import React from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import GlassNav from "../components/GlassNav";

export default function Exercises() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we are currently at a sub-route or the index route
  const isIndex = location.pathname === "/exercises";

  const handleBack = () => {
    if (!isIndex) {
      navigate("/exercises");
    } else {
      navigate("/");
    }
  };

  const exerciseOptions = [
    {
      id: "cbt",
      title: "CBT Modules",
      description: "Structured tools for cognitive restructuring and behavior activation.",
      icon: "🧠",
      path: "/exercises/cbt"
    },
    {
      id: "breathing",
      title: "Breathing Box",
      description: "Regulate your nervous system with rhythmic breathing.",
      icon: "🫁",
      path: "/exercises/breathing"
    },
    {
      id: "grounding",
      title: "5-4-3-2-1 Grounding",
      description: "Reconnect with your surroundings during moments of stress.",
      icon: "🧘",
      path: "/exercises/grounding"
    },
    {
      id: "ambient",
      title: "Ambient Soundscapes",
      description: "Immersive cosmic audio for relaxation and focus.",
      icon: "🌌",
      path: "/exercises/ambient"
    },
  ];

  return (
    <div className="w-screen h-screen relative overflow-y-auto bg-black text-[#00ffff] pb-24">
      <div className="relative z-10 h-full flex flex-col items-center justify-start">
        <div className="flex items-center gap-4 mb-10 w-full max-w-[1000px] absolute top-6 left-6 z-20">
          <button 
            className="px-4 py-2 border-none cursor-pointer text-white text-lg bg-white/10 backdrop-blur-md rounded-lg transition-transform hover:-translate-x-1 duration-200" 
            onClick={handleBack}
          >
            ← {!isIndex ? "Exercises" : "Home"}
          </button>
        </div>

        <h1 className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-[clamp(2rem,6vw,3.5rem)] font-medium tracking-[0.4rem] uppercase m-0 animate-flicker text-[#00ffff] filter drop-shadow-[0_0_10px_#00ffff] whitespace-nowrap">
          {!isIndex
            ? exerciseOptions.find((o) => location.pathname.includes(o.id))?.title
            : "Therapeutic Exercises"}
        </h1>

        <div className={`flex flex-col items-center justify-center w-full max-w-[1000px] ${isIndex ? 'mt-[180px]' : 'mt-[130px]'} mx-auto px-4`}>
          {isIndex ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 w-full">
              {exerciseOptions.map((opt) => (
                <Link
                  key={opt.id}
                  to={opt.path}
                  className="p-8 bg-white/5 backdrop-blur-md rounded-2xl text-center cursor-pointer transition-all duration-300 border border-white/10 text-white hover:-translate-y-2 hover:bg-white/10 hover:border-white/30 decoration-none flex flex-col items-center"
                >
                  <div className="text-5xl mb-4 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{opt.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{opt.title}</h3>
                  <p className="opacity-70 text-sm line-height-relaxed">{opt.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      <GlassNav activeButton="exercises" setActiveButton={(mode) => navigate(mode === 'exercises' ? '/exercises' : mode === 'voice' ? '/voice' : '/')} />
    </div>
  );
}
