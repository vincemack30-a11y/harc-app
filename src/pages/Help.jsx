// src/pages/Help.jsx
import React from "react";
import { Link } from "react-router-dom";

function HelpPage({ selectedCooler }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Help & Program Info</h2>
      <p className="text-sm mb-3">
        Learn more about HaRC Healthy Coolers and how to get support.
      </p>

      <h3 className="text-sm font-semibold mb-1">What is HaRC?</h3>
      <p className="text-sm mb-3">
        The Healthy & Resilient Communities (HaRC) program connects Detroit
        residents to healthier food options through Byte coolers, community
        partners, and care teams focused on Medicaid, Medicare, and primary
        care access.
      </p>

      <h3 className="text-sm font-semibold mb-1">Need help with insurance?</h3>
      <p className="text-sm mb-2">
        You can ask a community health worker to reach out to you about:
      </p>
      <ul className="list-disc list-inside text-sm mb-3">
        <li>Medicaid or Medicare enrollment or questions</li>
        <li>Finding a primary care provider</li>
        <li>Coverage questions and benefits</li>
      </ul>

      {selectedCooler && (
        <p className="text-xs mb-2">
          If you&apos;re at a cooler now, we&apos;ll attach this location to
          your request: <strong>{selectedCooler.name}</strong>.
        </p>
      )}

      <Link
        to="/intake"
        className="inline-block mt-1 mb-4 px-4 py-2 rounded bg-black text-white text-sm"
      >
        Request help with coverage
      </Link>

      <h3 className="text-sm font-semibold mb-1">Technical note</h3>
      <p className="text-xs">
        This is a demo application built for testing HaRC workflows. If you run
        into bugs, please share the time, what you clicked, and what you
        expected to see so the team can improve the tool.
      </p>
    </div>
  );
}

export default HelpPage;
