import React from "react";
import { useNavigate } from "react-router-dom";

const Staff = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  const goManager = () => {
    navigate("/manager");
  };

  const goAssist = () => {
    navigate("/assist");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-slate-800">
        <p className="text-[10px] uppercase tracking-[0.25em] text-orange-400">
          HARC Healthy Coolers
        </p>
        <h1 className="mt-1 text-xl font-semibold">Staff tools</h1>
        <p className="mt-1 text-xs text-slate-400">
          Shortcuts for Authority Health and partner staff working with this
          cooler location.
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 space-y-4 max-w-md">
        <button
          onClick={goManager}
          className="w-full rounded-full bg-orange-500 text-black text-sm font-semibold py-3"
        >
          Open manager dashboard
        </button>

        <button
          onClick={goAssist}
          className="w-full rounded-full border border-slate-700 bg-slate-900 text-slate-50 text-sm font-medium py-3"
        >
          Open coverage / navigation tools
        </button>

        <button
          onClick={goHome}
          className="w-full rounded-full border border-slate-700 bg-transparent text-slate-200 text-xs py-2"
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
