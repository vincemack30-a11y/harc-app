// src/pages/Staff.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Staff = () => {
  const navigate = useNavigate();

  const goManager = () => {
    navigate("/manager");
  };

  const goAssist = () => {
    navigate("/assist");
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-50 flex flex-col">
      <header className="px-4 pt-6 pb-4 border-b border-orange-200/60">
        <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500">
          HARC HEALTHY COOLERS
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Staff tools
        </h1>
        <p className="mt-1 text-xs text-slate-600 max-w-xl">
          Shortcuts for Authority Health and partner staff working with this
          cooler location.
        </p>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 max-w-md">
        <button
          onClick={goManager}
          className="w-full rounded-full bg-orange-500 text-black text-sm font-semibold py-2 border border-orange-600"
        >
          Open manager dashboard
        </button>

        <button
          onClick={goAssist}
          className="w-full rounded-full border border-slate-900 text-sm font-semibold py-2 bg-white/80"
        >
          Open coverage / navigation tools
        </button>

        <button
          onClick={goHome}
          className="w-full rounded-full border border-slate-700 text-sm font-semibold py-2 bg-transparent"
        >
          Back to customer home screen
        </button>

        <p className="mt-4 text-[11px] text-slate-500">
          Tip: Bookmark this page on staff tablets or phones to quickly access
          dashboard tools while working in the field.
        </p>
      </main>
    </div>
  );
};

export default Staff;
