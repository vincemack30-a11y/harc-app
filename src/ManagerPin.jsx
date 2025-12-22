// src/ManagerPin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ManagerPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // Use env var if it exists, otherwise fall back to 1357
  const EXPECTED_PIN = import.meta.env.VITE_MANAGER_PIN || "1357";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === EXPECTED_PIN) {
      setError("");
      navigate("/manager/dashboard");
    } else {
      setError("Incorrect PIN. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-orange-50 to-emerald-50 flex flex-col">
      {/* Header / brand */}
      <header className="border-b border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
        <div className="leading-tight">
          <p className="font-semibold tracking-[0.18em] text-[10px] uppercase">
            HARC HEALTHY COOLERS
          </p>
          <p className="text-[11px] text-slate-600">
            Grab &amp; go · Better choices · Detroit
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-[11px] px-3 py-1 rounded-full border border-slate-300 hover:bg-white/70"
        >
          Back to customer view
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pt-8 pb-12 flex justify-center">
        <div className="w-full max-w-sm bg-white/80 backdrop-blur rounded-3xl shadow-md px-6 py-7 border border-slate-200">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">
            Manager portal
          </h1>
          <p className="text-xs text-slate-600 mb-5">
            Enter the 4-digit PIN to view cooler performance and orders.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="pin"
                className="block text-[11px] font-medium text-slate-700 mb-1"
              >
                Manager PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm tracking-[0.35em] text-center bg-white/80 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                placeholder="••••"
              />
              {error && (
                <p className="mt-2 text-[11px] text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-full bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 disabled:opacity-60"
              disabled={pin.length < 4}
            >
              Unlock dashboard
            </button>

            <p className="text-[10px] text-slate-500 mt-2">
              For pilot use only. If you need access, contact the HaRC team.
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 pb-4 pt-2 text-[10px] text-slate-500">
        HaRC · Authority Health · Detroit Wayne County · Powered by Byte +
        community partners
      </footer>
    </div>
  );
};

export default ManagerPin;
