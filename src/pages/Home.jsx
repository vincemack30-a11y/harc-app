// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { COOLERS } from "../data"; // list of cooler locations

export default function Home() {
  const navigate = useNavigate();

  const handleCoolerClick = (cooler) => {
    navigate("/menu", {
      state: {
        coolerId: cooler.id,
        coolerName: cooler.name,
      },
    });
  };

  return (
    <div className="pt-8 pb-10">
      {/* Page header */}
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-500">
          HaRC Healthy Coolers
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
          Welcome to HaRC Healthy Coolers
        </h1>
        <p className="text-sm text-slate-700 mt-2">
          Pick a cooler location to begin your order.
        </p>
      </header>

      {/* Cooler list */}
      <div className="space-y-3 text-sm">
        {COOLERS.map((cooler) => (
          <button
            key={cooler.id}
            type="button"
            onClick={() => handleCoolerClick(cooler)}
            className="w-full text-left border border-slate-300 rounded-xl px-4 py-3 bg-white hover:bg-orange-50"
          >
            <p className="font-semibold text-slate-900">
              {cooler.name}
            </p>
            {cooler.subtitle && (
              <p className="text-xs text-slate-600 mt-1">
                {cooler.subtitle}
              </p>
            )}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 mt-6">
        HaRC • Authority Health • Detroit Wayne County. Powered by Byte +
        community partners.
      </p>
    </div>
  );
}
