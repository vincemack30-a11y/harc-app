import React from "react";
import { useNavigate } from "react-router-dom";

const Staff = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-5 py-6 border-b border-orange-200/60 bg-white/60 backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500">
          HaRC Healthy Coolers
        </p>
        <h1 className="text-xl font-bold mt-1">Staff Tools</h1>
        <p className="text-xs text-slate-600 mt-1">
          Quick links for Authority Health CHWs & managers.
        </p>
      </header>

      {/* Main Actions */}
      <main className="px-5 pt-6 space-y-4 max-w-md mx-auto w-full flex-1">
        <button
          onClick={() => navigate("/manager")}
          className="w-full py-4 rounded-2xl bg-orange-500 text-black font-semibold text-sm shadow-md shadow-orange-200"
        >
          Manager Tools (PIN required)
        </button>

        <button
          onClick={() => navigate("/assist")}
          className="w-full py-4 rounded-2xl bg-white/80 border border-slate-300 text-slate-800 text-sm shadow-sm"
        >
          Coverage / Help Requests
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-2xl bg-white/60 border border-slate-200 text-slate-700 text-sm"
        >
          Back to Home
        </button>
      </main>

      <footer className="px-4 py-6 text-center text-[11px] text-slate-500">
        Tip: Bookmark this page on staff tablets for quick access.
      </footer>
    </div>
  );
};

export default Staff;
