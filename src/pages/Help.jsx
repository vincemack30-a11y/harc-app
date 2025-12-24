import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

/**
 * Help.jsx (defensive insert)
 * - Keeps the UI fields (name/phone/need/details)
 * - Inserts into intake_requests WITHOUT assuming columns exist
 * - If Supabase complains about a missing column (ex: 'name'),
 *   we remove that field and retry automatically.
 */

function buildPayload({ cooler_id, name, phone, need, details }) {
  // Start with "best case" payload (we'll remove keys if the DB rejects them)
  return {
    cooler_id: cooler_id || null,
    name: name?.trim() || null,
    phone: phone?.trim() || null,
    need: need || null,
    details: details?.trim() || null,
    source: "harc-app",
    // created_at: new Date().toISOString(), // optional; DB default preferred
  };
}

// Extract missing column name from error message patterns we’ve seen.
// Example: "Could not find the 'name' column of 'intake_requests' in the schema cache"
function parseMissingColumn(errMsg) {
  if (!errMsg) return null;

  // pattern: "Could not find the 'XYZ' column ..."
  const m1 = errMsg.match(/Could not find the '([^']+)' column/i);
  if (m1?.[1]) return m1[1];

  // fallback: sometimes messages mention "column XYZ does not exist"
  const m2 = errMsg.match(/column ["']?([^"'\s]+)["']? does not exist/i);
  if (m2?.[1]) return m2[1];

  return null;
}

async function insertWithFallback(payload) {
  // Try up to a few times, removing unknown keys if Supabase rejects them.
  let working = { ...payload };

  for (let attempt = 1; attempt <= 4; attempt++) {
    const { error } = await supabase.from("intake_requests").insert([working]);
    if (!error) return { ok: true, removed: [] };

    const msg = error.message || String(error);
    const missing = parseMissingColumn(msg);

    // If it's a missing-column error AND that key exists in payload, remove and retry.
    if (missing && Object.prototype.hasOwnProperty.call(working, missing)) {
      delete working[missing];
      continue;
    }

    // Not a missing-column case (or we can't auto-fix) -> stop and return error.
    return { ok: false, error };
  }

  return {
    ok: false,
    error: { message: "Insert failed after multiple schema fallbacks." },
  };
}

export default function Help({ ctx }) {
  const cooler_id = ctx?.selectedCoolerId || null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [need, setNeed] = useState("Medicaid/Medicare assistance");
  const [details, setDetails] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    setIsSending(true);

    try {
      const payload = buildPayload({ cooler_id, name, phone, need, details });

      const result = await insertWithFallback(payload);

      if (!result.ok) {
        throw result.error;
      }

      setMsg("Submitted. A team member will follow up.");
      setName("");
      setPhone("");
      setDetails("");
      setNeed("Medicaid/Medicare assistance");
    } catch (e) {
      console.error("[HaRC] intake submit error", e);
      setMsg(e?.message || "Submit failed. Check Supabase table + RLS + env vars.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Get Help</h1>
      <p className="h2">
        Request assistance (Medicaid/Medicare, primary care, food resources, etc.).
      </p>

      <hr className="hr" />

      <div style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
        />
        <input
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (optional)"
        />

        <select className="input" value={need} onChange={(e) => setNeed(e.target.value)}>
          <option>Medicaid/Medicare assistance</option>
          <option>Primary care appointment</option>
          <option>Nutrition resources</option>
          <option>Food access support</option>
          <option>Other</option>
        </select>

        <input
          className="input"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Short details (optional)"
        />

        <button className="btn btn-green" disabled={isSending} onClick={submit}>
          {isSending ? "Sending..." : "Submit Request"}
        </button>

        {msg ? <div className="small">{msg}</div> : null}

        {cooler_id ? (
          <div className="small">
            Linked cooler: <code>{cooler_id}</code>
          </div>
        ) : (
          <div className="small" style={{ opacity: 0.8 }}>
            No cooler selected (request will still submit).
          </div>
        )}
      </div>

      <hr className="hr" />

      <div className="row">
        <Link to="/coolers" className="btn btn-primary">
          Back to Coolers
        </Link>
        <Link to="/menu" className="btn">
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
