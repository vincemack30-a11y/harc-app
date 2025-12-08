import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SURVEY_URL =
  "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

const Confirmation = () => {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const totalItems = Number(state?.totalItems ?? 0);
  const subtotal = Number(state?.subtotal ?? 0);

  const handleSurveyClick = () => {
    window.open(SURVEY_URL, "_blank", "noopener,noreferrer");
  };

  const handleDone = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-10 pb-4 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          HARC HEALTHY COOLERS
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Order confirmed ✅
        </h1>
        <p className="mt-2 text-sm text-slate-700 max-w-xl mx-auto">
          Thank you for choosing a healthy option today. Your order is being
          processed at the cooler.
        </p>
      </header>

      {/* Summary */}
      <main className="flex-1 px-4 py-4">
        <div className="border border-slate-200 rounded-2xl bg-white/60 p-4 max-w-md mx-auto space-y-2 text-sm text-slate-800">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 max-w-md mx-auto">
          If anything looks incorrect, please let an Authority Health team
          member know or submit a help request from the Help screen.
        </p>
      </main>

      {/* Buttons */}
      <footer className="px-4 pb-6 space-y-2 max-w-md mx-auto w-full">
        <button
          onClick={handleSurveyClick}
          className="w-full rounded-full bg-slate-900 text-white text-sm font-semibold py-3"
        >
          Share quick feedback (30 seconds)
        </button>
        <button
          onClick={handleDone}
          className="w-full rounded-full border border-slate-300 bg-white/70 text-slate-900 text-sm font-medium py-3"
        >
          Done – back to Home
        </button>
      </footer>
    </div>
  );
};

export default Confirmation;
