// src/pages/Help.jsx
import React from "react";

export default function Help() {
  return (
    <main className="min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Help</h2>
      <p className="text-sm text-gray-700 mb-4">
        Need help with a HaRC Healthy Cooler, questions about food options, or
        support connecting to health coverage? Use the contact options below.
      </p>

      <section className="space-y-4">
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">
            Talk to a HaRC Team Member
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            Call or email our team for questions about coolers, food options, or
            program details.
          </p>
          <p className="text-sm text-gray-900 mt-3">
            Phone: <span className="font-semibold">[Add phone number later]</span>
          </p>
          <p className="text-sm text-gray-900">
            Email:{" "}
            <span className="font-semibold">[Add email address later]</span>
          </p>
        </article>

        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">
            Medicaid / Medicare Assistance
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            If you need help signing up for Medicaid or Medicare, a community
            health worker can follow up with you.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            In the full version of this app, this section will include a short
            form so a HaRC community health worker can contact you directly.
          </p>
        </article>
      </section>
    </main>
  );
}
