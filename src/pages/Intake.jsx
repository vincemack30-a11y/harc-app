// src/pages/Intake.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.DEV
  ? "https://harc-r4yekhdui-vincemack30-7988s-projects.vercel.app"
  : "";

function IntakePage({ selectedCooler }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [needInsurance, setNeedInsurance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("");

    try {
      const now = new Date().toISOString();

      const payload = {
        name: name || null,
        phone: phone || null,
        needInsurance,
        need_insurance: needInsurance, // both versions
        coolerId: selectedCooler ? selectedCooler.id : null,
        cooler_id: selectedCooler ? selectedCooler.id : null,
        createdAt: now,
        created_at: now,
      };

      const res = await fetch(`${API_BASE}/api/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        console.error("Intake error:", data || res.statusText);
        setStatus(
          "Submission failed. Please check your info or try again in a moment."
        );
        setSubmitting(false);
        return;
      }

      setStatus(
        "Thank you! A community health worker will follow up with you soon."
      );
      setName("");
      setPhone("");
      setNeedInsurance(false);
      setSubmitting(false);
    } catch (err) {
      console.error("Intake network error:", err);
      setStatus("Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        Need help with coverage or a doctor?
      </h2>
      <p className="text-sm mb-3">
        Fill this out if you want a community health worker to reach out about
        Medicaid/Medicare, food help, or finding a primary care provider.
      </p>

      {selectedCooler ? (
        <p className="text-xs mb-2">
          Cooler: <strong>{selectedCooler.name}</strong>
        </p>
      ) : (
        <p className="text-xs mb-2 bg-white/60 px-3 py-2 rounded">
          No cooler selected yet. That&apos;s okay, but if you are at a cooler
          now you can pick it on the{" "}
          <Link to="/coolers" className="underline">
            Coolers
          </Link>{" "}
          tab so staff know where this request came from.
        </p>
      )}

      <form onSubmit={handleSubmit} className="text-sm">
        <div className="mb-2">
          <label className="block mb-1">Name (optional)</label>
          <input
            className="px-2 py-1 rounded border border-gray-400 w-full max-w-xs"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1">Phone (optional)</label>
          <input
            className="px-2 py-1 rounded border border-gray-400 w-full max-w-xs"
            placeholder="Best number to reach you"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <label className="flex items-center mb-3 text-sm">
          <input
            type="checkbox"
            className="mr-2"
            checked={needInsurance}
            onChange={(e) => setNeedInsurance(e.target.checked)}
          />
          I want help with Medicaid/Medicare or a primary care provider.
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit request"}
        </button>
      </form>

      {status && (
        <p className="mt-3 text-xs bg-white/60 px-3 py-2 rounded">
          {status}
        </p>
      )}
    </div>
  );
}

export default IntakePage;
