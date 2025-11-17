// src/pages/Survey.jsx
import React from "react";

function Survey() {
  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="section-title">HaRC Healthy Coolers Survey</h2>
        <p className="section-subtitle">
          Your feedback helps us improve the HaRC Healthy Coolers program,
          choose better food options, and expand cooler locations.
        </p>

        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <p>
            This short survey is hosted by the Michigan Public Health Institute
            (MPHI). Your responses are confidential and used for program
            improvement only.
          </p>

          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
            <li>Takes about 3–5 minutes to complete</li>
            <li>Questions about your cooler experience and food choices</li>
            <li>No right or wrong answers — we just want your honest input</li>
          </ul>

          <p className="text-xs text-slate-500">
            When you tap the button below, you’ll be taken to an external
            survey website in a new tab.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            Start survey
          </a>

          <p className="text-[11px] text-slate-500">
            If the survey does not open, check your pop-up settings or try again
            later from the same device.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Survey;
