// src/pages/Intake.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ORANGE } from "../data";
import { getCanonicalCoolerIdFromSelectedCooler } from "../coolerIdMap";

// If your app uses a shared context for selectedCooler, we try to use it.
// If your AppContext export name differs, tell me and I’ll align it.
import { useApp } from "../AppContext";

const TOPICS = [
  "Medicaid / Medicare help",
  "Primary care appointment",
  "Food access / benefits question",
  "Other",
];

export default function Intake() {
  const nav = useNavigate();

  // Expected from your existing app state:
  // - selectedCooler: the currently-selected cooler object
  const { selectedCooler } = useApp();

  const canonicalCoolerId = useMemo(() => {
    return getCanonicalCoolerIdFromSelectedCooler(selectedCooler);
  }, [selectedCooler]);

  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [details, setDetails] = useState("");
  const [needsPrimaryCare, setNeedsPrimaryCare] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    !!canonicalCoolerId && !!topic && details.trim().length >= 2 && !isSubmitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMsg("");

    if (!canonicalCoolerId) {
      setStatusMsg("No cooler selected. Go back and select a cooler first.");
      return;
    }

    if (details.trim().length < 2) {
      setStatusMsg("Please add a short note in Details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        phone: phone.trim() ? phone.trim() : null,
        cooler_id: canonicalCoolerId, // ✅ CANONICAL ALWAYS (popoff/hope/partner_1)
        source: "harc-app",
        notes: null,
        needs_primary_care: !!needsPrimaryCare,
        status: "new",
        topic,
        details: details.trim(),
      };

      const { error } = await supabase.from("intake_requests").insert([payload]);
      if (error) throw error;

      setStatusMsg("Submitted. Thank you — a team member will follow up.");
      setPhone("");
      setTopic(TOPICS[0]);
      setDetails("");
      setNeedsPrimaryCare(false);

      // Optional: route to a confirmation page if you have one
      // nav("/confirmation");
    } catch (err) {
      setStatusMsg(err?.message || "Submission failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: ORANGE.bg, padding: 16 }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: ORANGE.text }}>
              Request Help
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, color: ORANGE.text }}>
              Submit an intake request. This writes to <code>intake_requests</code>.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => nav(-1)} style={btnGhost}>
              Back
            </button>
            <button onClick={() => nav("/")} style={btnGhost}>
              Home
            </button>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 900, marginBottom: 6, color: ORANGE.text }}>
            Selected Cooler
          </div>

          <div style={{ fontSize: 14, color: ORANGE.text }}>
            {selectedCooler ? (
              <>
                <div style={{ fontWeight: 800 }}>{selectedCooler.name}</div>
                <div style={{ opacity: 0.85 }}>{selectedCooler.address}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                  Canonical cooler_id saved to Supabase:{" "}
                  <code style={code}>{canonicalCoolerId || "MISSING"}</code>
                </div>
              </>
            ) : (
              <div style={{ color: "#b45309", fontWeight: 800 }}>
                No cooler selected. Go back and pick a cooler first.
              </div>
            )}
          </div>
        </div>

        <div style={card}>
          <form onSubmit={handleSubmit}>
            <div style={grid2}>
              <div>
                <label style={label}>Phone (optional)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(313) 555-1234"
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Topic</label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} style={input}>
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Details</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us what you need help with…"
                style={{ ...input, minHeight: 110, resize: "vertical" }}
              />
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, color: ORANGE.text }}>
                Minimum 2 characters. Keep it brief and clear.
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="primarycare"
                type="checkbox"
                checked={needsPrimaryCare}
                onChange={(e) => setNeedsPrimaryCare(e.target.checked)}
              />
              <label htmlFor="primarycare" style={{ fontSize: 14, color: ORANGE.text }}>
                I need help connecting to primary care
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button type="submit" style={canSubmit ? btnPrimary : btnDisabled} disabled={!canSubmit}>
                {isSubmitting ? "Submitting…" : "Submit Request"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusMsg("");
                  setPhone("");
                  setTopic(TOPICS[0]);
                  setDetails("");
                  setNeedsPrimaryCare(false);
                }}
                style={btnGhost}
                disabled={isSubmitting}
              >
                Clear
              </button>
            </div>

            {statusMsg ? (
              <div style={{ marginTop: 12, fontSize: 14, color: ORANGE.text }}>
                <span style={{ fontWeight: 900 }}>Status:</span>{" "}
                <span style={{ opacity: 0.9 }}>{statusMsg}</span>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: ORANGE.card,
  border: `1px solid ${ORANGE.border}`,
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
};

const label = {
  display: "block",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
  color: ORANGE.text,
  opacity: 0.85,
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: 14,
  background: "#fff",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

const btnDisabled = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#e5e7eb",
  color: "#6b7280",
  cursor: "not-allowed",
  fontWeight: 900,
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 900,
};

const code = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  borderRadius: 8,
  padding: "2px 6px",
};
