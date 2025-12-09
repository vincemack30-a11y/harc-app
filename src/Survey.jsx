import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SURVEY_URL =
  "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

const Survey = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Try to open the official survey in a new tab as soon as this page loads
    window.open(SURVEY_URL, "_blank", "noopener,noreferrer");
  }, []);

  const handleOpenSurvey = () => {
    window.open(SURVEY_URL, "_blank", "noopener,noreferrer");
  };

  const handleDone = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-orange-200/60 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500">
            HARC HEALTHY COOLERS
          </p>
          <h1 className="text-xl font-semibold mt-1">Quick feedback</h1>
          <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
            We&apos;ve opened the official feedback survey in a new tab.
            Your answers help Authority Health and our partners improve
            this cooler.
          </p>
        </div>
        <button
          onClick={handleDone}
          className="text-[11px] border border-slate-300 px-3 py-1 rounded-full bg-white/80"
        >
          Done
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 py-6 flex flex-col items-center">
        <div className="w-full max-w-sm rounded-3xl bg-white/90 border border-orange-200 shadow-sm p-6 text-center">
          <p className="text-sm text-slate-800">
            If the survey didn&apos;t open automatically, tap the button
            below to open it.
          </p>

          <button
            onClick={handleOpenSurvey}
            className="mt-4 w-full bg-orange-500 text-black font-semibold py-2.5 rounded-full text-sm"
          >
            Open survey
          </button>

          <p className="mt-3 text-[11px] text-slate-500">
            When you&apos;re finished, close the survey tab and return here.
            You can tap &quot;Done&quot; to go back to the home screen.
          </p>

          <button
            onClick={handleDone}
            className="mt-4 w-full border border-slate-300 text-slate-800 font-medium py-2.5 rounded-full text-sm bg-white/70"
          >
            Done – back to home
          </button>
        </div>
      </main>
    </div>
  );
};

export default Survey;
