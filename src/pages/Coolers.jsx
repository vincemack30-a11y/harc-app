// src/pages/Coolers.jsx
import React, { useState } from "react";
import { COOLERS } from "../data";

export default function Coolers() {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <main className="min-h-screen">
      {/* Intro / “Summarize” bar */}
      <section className="mb-4">
        <button
          type="button"
          onClick={() => setShowSummary(true)}
          className="w-full rounded-full bg-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 transition"
        >
          📝 Summarize
        </button>
      </section>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4">
        Find HaRC Healthy Coolers at our partner clinics and hubs.
      </p>

      {/* List of coolers */}
      <section className="space-y-4">
        {COOLERS.map((c) => (
          <article
            key={c.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <h2 className="text-lg font-semibold text-gray-900">{c.name}</h2>
            <p className="text-sm text-gray-700 mt-1">{c.address}</p>
            <p className="text-xs text-gray-500 mt-1">ZIP: {c.zip}</p>
          </article>
        ))}
      </section>

      {/* Summary modal */}
      {showSummary && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              HaRC Healthy Coolers – Summary
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
              <li>3 active HaRC Healthy Cooler locations in Detroit.</li>
              <li>
                Sites include Popoff Family Health Center, New Center One, and a
                Mack &amp; Eastside hub.
              </li>
              <li>
                Focused on grab-and-go healthy meals and snacks in trusted
                health settings.
              </li>
              <li>
                Future versions will add real-time inventory, ordering, and
                Medicaid/Medicare support.
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setShowSummary(false)}
              className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
