import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

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
      const payload = {
        cooler_id,
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        need,
        details: details?.trim() || null,
        created_at: new Date().toISOString(),
        status: "new",
      };

      const { error } = await supabase.from("help_requests").insert([payload]);
      if (error) throw error;

      setMsg("Submitted. A team member will follow up.");
      setName("");
      setPhone("");
      setDetails("");
    } catch (e) {
      console.error("[HaRC] help submit error", e);
      setMsg(e?.message || "Submit failed. Check Supabase table + RLS + env vars.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Get Help</h1>
      <p className="h2">Request assistance (Medicaid/Medicare, primary care, food resources, etc.).</p>

      <hr className="hr" />

      <div style={{ display: "grid", gap: 10 }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" />
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (optional)" />

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
