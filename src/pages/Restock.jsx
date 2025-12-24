import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const STATUSES = ["open", "in_progress", "done", "cancelled"];

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts || "");
  }
}

export default function Restock({ ctx }) {
  const { COOLERS = [] } = ctx || {};

  const [daysBack, setDaysBack] = useState(14);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [filterCooler, setFilterCooler] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const coolerNameById = useMemo(() => {
    const m = new Map();
    COOLERS.forEach((c) => m.set(c.cooler_id, c.name));
    return m;
  }, [COOLERS]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okCooler = filterCooler === "all" ? true : r.cooler_id === filterCooler;
      const okStatus = filterStatus === "all" ? true : r.status === filterStatus;
      return okCooler && okStatus;
    });
  }, [rows, filterCooler, filterStatus]);

  async function refresh() {
    setMsg("");
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("manager_restock_queue", {
        days_back: Number(daysBack || 14),
      });
      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
      if (!data || data.length === 0) setMsg("No restock requests found for this window.");
    } catch (e) {
      console.error("[HaRC] manager_restock_queue error", e);
      setMsg(e?.message || "Failed to load restock requests.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(requestId, newStatus) {
    setMsg("");
    try {
      const { error } = await supabase.rpc("manager_set_restock_status", {
        request_id: requestId,
        new_status: newStatus,
      });
      if (error) throw error;

      setRows((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
    } catch (e) {
      console.error("[HaRC] manager_set_restock_status error", e);
      setMsg(e?.message || "Failed to update request status.");
    }
  }

  async function createRequest(coolerId, urgency = "normal") {
    setMsg("");
    try {
      const note = window.prompt("Optional note for restock request (leave blank if none):", "");
      const { data, error } = await supabase.rpc("create_restock_request", {
        cooler_id: coolerId,
        requested_by: "manager",
        urgency,
        note: note || null,
      });
      if (error) throw error;

      // prepend new request
      if (data) setRows((prev) => [data, ...prev]);
    } catch (e) {
      console.error("[HaRC] create_restock_request error", e);
      setMsg(e?.message || "Failed to create restock request.");
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Restock</h1>
      <p className="h2">Manager restock queue (RLS-safe via RPC).</p>

      <hr className="hr" />

      <div className="card" style={{ borderRadius: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Controls</div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: 160 }}>
            <div className="small">Days back</div>
            <input
              className="input"
              type="number"
              min="1"
              max="90"
              value={daysBack}
              onChange={(e) => setDaysBack(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <div className="small">Filter cooler</div>
            <select className="input" value={filterCooler} onChange={(e) => setFilterCooler(e.target.value)}>
              <option value="all">All coolers</option>
              {COOLERS.map((c) => (
                <option key={c.cooler_id} value={c.cooler_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 220 }}>
            <div className="small">Filter status</div>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {msg ? (
          <div className="small" style={{ marginTop: 10 }}>
            {msg}
          </div>
        ) : null}
      </div>

      <hr className="hr" />

      <div className="card" style={{ borderRadius: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Quick Create</div>
        <div className="small" style={{ marginBottom: 10 }}>
          Create a restock request for a specific cooler. “Urgent” should be used sparingly.
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {COOLERS.map((c) => (
            <div
              key={c.cooler_id}
              className="row"
              style={{
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: 12,
                background: "white",
              }}
            >
              <div>
                <div style={{ fontWeight: 900 }}>{c.name}</div>
                <div className="small">
                  <span className="badge">{c.cooler_id}</span>
                </div>
              </div>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => createRequest(c.cooler_id, "normal")}>
                  Request Restock
                </button>
                <button className="btn btn-green" onClick={() => createRequest(c.cooler_id, "urgent")}>
                  Urgent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="hr" />

      <div className="small" style={{ marginBottom: 8 }}>
        Showing <strong>{filtered.length}</strong> requests
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ borderRadius: 14 }}>
          <div className="small">No restock requests match your filters.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((r) => (
            <div key={r.id} className="card" style={{ borderRadius: 14 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>
                    {coolerNameById.get(r.cooler_id) || r.cooler_id}
                  </div>
                  <div className="small" style={{ marginTop: 6 }}>
                    <span className="badge">{r.cooler_id}</span>{" "}
                    <span className="badge">{r.status}</span>{" "}
                    <span className="badge">{r.urgency}</span>
                  </div>
                  <div className="small" style={{ marginTop: 6 }}>
                    Created: {fmtDate(r.created_at)}
                    {r.resolved_at ? ` • Resolved: ${fmtDate(r.resolved_at)}` : ""}
                  </div>
                  {r.note ? (
                    <div className="small" style={{ marginTop: 8 }}>
                      <strong>Note:</strong> {r.note}
                    </div>
                  ) : null}
                </div>

                <div style={{ minWidth: 210 }}>
                  <div className="small" style={{ marginBottom: 6 }}>
                    Update status
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <button className="btn" disabled={r.status === "open"} onClick={() => setStatus(r.id, "open")}>
                      Mark Open
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={r.status === "in_progress"}
                      onClick={() => setStatus(r.id, "in_progress")}
                    >
                      In Progress
                    </button>
                    <button className="btn btn-green" disabled={r.status === "done"} onClick={() => setStatus(r.id, "done")}>
                      Done
                    </button>
                    <button className="btn" disabled={r.status === "cancelled"} onClick={() => setStatus(r.id, "cancelled")}>
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>

              <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>
                Request ID: {r.id}
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="hr" />

      <div className="row">
        <Link to="/manager/status" className="btn">
          Status
        </Link>
        <Link to="/manager/analytics" className="btn btn-primary">
          Analytics
        </Link>
        <Link to="/" className="btn">
          Exit Manager
        </Link>
      </div>
    </div>
  );
}
