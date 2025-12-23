import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Manager() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function unlock() {
    setMsg("");
    setIsChecking(true);

    try {
      // RPC must be public.manager_unlock(pin text)
      const { data, error } = await supabase.rpc("manager_unlock", { pin });
      if (error) throw error;

      if (data === true) {
        setMsg("Unlocked.");
        navigate("/manager/analytics");
      } else {
        setMsg("Incorrect PIN.");
      }
    } catch (e) {
      console.error("[HaRC] manager unlock error", e);
      setMsg(e?.message || "Unlock failed. Check RPC + schema cache + RLS.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Manager Access</h1>
      <p className="h2">Enter manager PIN to view analytics and status.</p>

      <hr className="hr" />

      <input
        className="input"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter PIN"
        inputMode="numeric"
      />

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" disabled={isChecking} onClick={unlock}>
          {isChecking ? "Checking..." : "Unlock"}
        </button>
        <Link className="btn" to="/">
          Back to App
        </Link>
      </div>

      {msg ? (
        <div style={{ marginTop: 12 }} className="small">
          {msg}
        </div>
      ) : null}
    </div>
  );
}
