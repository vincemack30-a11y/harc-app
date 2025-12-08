import React from "react";
import { useNavigate } from "react-router-dom";

const SURVEY_URL =
  "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

const Home = () => {
  const navigate = useNavigate();

  const handleStartOrder = () => {
    navigate("/coolers");
  };

  const handleGoToHelp = () => {
    navigate("/help");
  };

  const handleGoToSurvey = () => {
    window.open(SURVEY_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome to HaRC Healthy Coolers
        </h1>
        <p className="mt-2 text-sm text-slate-700 max-w-xl">
          Find healthy grab-and-go meals, snacks, and drinks in Byte coolers
          across Detroit, and connect to Medicaid/Medicare help and community
          resources.
        </p>
      </header>

      {/* Main actions */}
      <main className="flex-1 px-4 space-y-4">
        <button
          onClick={handleStartOrder}
          className="w-full max-w-sm rounded-full bg-orange-500 text-black font-semibold text-sm py-3 px-4 shadow-sm"
        >
          Start an order
        </button>

        <div className="max-w-sm space-y-2 text-sm text-slate-700">
          <p>
            Use the button above to pick your cooler, choose items from the
            menu, and review your cart before checkout.
          </p>
        </div>

        <div className="max-w-sm mt-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Need support?
          </p>
          <button
            onClick={handleGoToHelp}
            className="w-full rounded-full border border-slate-300 bg-white/70 text-slate-900 text-sm font-medium py-3 px-4"
          >
            Request coverage or ask for help
          </button>

          <button
            onClick={handleGoToSurvey}
            className="w-full rounded-full border border-slate-300 bg-white/40 text-slate-800 text-xs py-2 px-4"
          >
            Leave quick feedback about the cooler
          </button>
        </div>
      </main>

      {/* Footer hint */}
      <footer className="px-4 pb-6 text-[11px] text-slate-500">
        Powered by Authority Health’s HaRC Initiative &amp; Byte Technology.
      </footer>
    </div>
  );
};

export default Home;
