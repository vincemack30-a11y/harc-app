// src/pages/Survey.jsx
import React from "react";

const SURVEY_URL =
  "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

export default function Survey() {
  return (
    <main className="min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Survey</h2>
      <p className="text-sm text-gray-700 mb-4">
        Tell us how the HaRC Healthy Coolers are working for you. Your
        responses help improve food options, cooler locations, and support
        services.
      </p>

      <a
        href={SURVEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition"
      >
        Open Survey in New Tab
      </a>

      <p className="text-xs text-gray-500 mt-3">
        The link above will take you to our secure survey page hosted by MPHI.
      </p>
    </main>
  );
}
