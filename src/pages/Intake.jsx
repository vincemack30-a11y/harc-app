// src/pages/Intake.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import supabase from "../supabaseClient";

export default function IntakePage() {
  const navigate = useNavigate();
  const { selectedCoolerId, selectedCooler } = useAppContext();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [needsPrimaryCare, setNeedsPrimaryCare] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");

    try {
      // Build payload for public_intake_requests table
      const payload = {
        cooler_id: selectedCoolerId || null,
        phone: phone.trim() || null,
        needs_primary_care: needsPrimaryCare,
        source: "harc-app",
      };

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      // Optional: keep name in notes if you want it but don't have a column
      if (name.trim() && !notes.trim()) {
        payload.notes = `Name: ${name.trim()}`;
      } else if (name.trim() && notes.trim()) {
        payload.notes = `Name: ${name.trim()} — ${notes.trim()}`;
      }

      const { error } = await supabase
        .from("intake_requests")
        .insert(payload);

      if (error) {
        console.error("Supabase intake error:", error);
        throw error;
      }

      setStatus("success");
      setName("");
      setPhone("");
      setNotes("");

      // Optional: send them back to Home after a short moment
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      console.error("Intake submit error:", err);
      setStatus("error");
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-harc-soft p-6 space-y-4">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-harc-dark">
            Need help with coverage or a doctor?
          </h2>
          <p className="text-sm text-harc-muted leading-relaxed">
            Fill this out if you want a community health worker to reach out
            about Medicaid/Medicare, food help, or finding a primary care
            provider.
          </p>

          <p className="text-xs text-harc-muted">
            {selectedCooler
              ? <>This request will be linked to <span className="font-semibold">{selectedCooler.name}</span>.</>
              : <>No cooler selected yet. That&apos;s okay — staff can still see and follow up.</>}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-harc-dark">Name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-harc-soft px-3 py-2 text-sm text-harc-dark focus:outline-none focus:ring-2 focus:ring-harc-accent focus:border-harc-accent bg-white"
                placeholder="First and last name"
              />
            </label>

            <label className="block text-sm">
              <span className="text-harc-dark">Phone (optional)</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-harc-soft px-3 py-2 text-sm text-harc-dark focus:outline-none focus:ring-2 focus:ring-harc-accent focus:border-harc-accent bg-white"
                placeholder="Best number to reach you"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-harc-dark">
              What do you need help with? (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-harc-soft px-3 py-2 text-sm text-harc-dark focus:outline-none focus:ring-2 focus:ring-harc-accent focus:border-harc-accent bg-white"
              placeholder="Example: Help with Medicaid, finding a doctor, food, or other support."
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-harc-dark">
            <input
              type="checkbox"
              checked={needsPrimaryCare}
              onChange={(e) => setNeedsPrimaryCare(e.target.checked)}
              className="h-4 w-4 rounded border-harc-soft text-harc-accent focus:ring-harc-accent"
            />
            <span>I want help with Medicaid/Medicare or a primary care provider.</span>
          </label>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full bg-harc-accent text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
            </button>

            {status === "success" && (
              <p className="text-xs text-emerald-700">
                Thanks! A HaRC team member will follow up soon.
              </p>
            )}

            {status === "error" && (
              <p className="text-xs text-red-700">
                Submission failed. Please try again.
              </p>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
