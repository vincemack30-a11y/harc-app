// src/pages/Status.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const STATUS_OPTIONS = ["placed", "fulfilled", "cancelled"];

function fmtMoney(n) {
  const x = Number(n || 0);
  return `$${x.toFixed(2)}`;
}

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts || "");
  }
}

// Supabase jsonb usually arrives as JS objects.
// But this guards against weird shapes.
function normalizeItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  // If it’s an object, not array: ignore (not expected)
  return [];
}

export default function Status({ ctx }) {
  const { COOLERS = [] } = ctx || {};

  const [daysBack, setDaysBack] = useState(7);
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
      const { data, error } = await supabase.rpc("manager_recent_orders", {
        days_back: Number(daysBack || 7),
      });

      if (error) throw error;

      const list = Array.isArray(data) ? data : [];
      setRows(list);

      if (list.length === 0) {
        setMsg("No orders found for this window.");
      }
    } catch (e) {
      console.error("[HaRC] manager_recent_orders error", e);
      setMsg(e?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(orderId, newStatus) {
    setMsg("");

    try {
      const { error } = await supabase.rpc("manager_set_order_status", {
        order_id: orderId,
        new_status: newStatus,
      });

      if (error) throw error;

      // Optimistic local update
      setRows((prev) =>
        prev.map((r) => (r.id === orderId ? { ...r, status: newStatus } : r))
      );
    } catch (e) {
      console.error("[HaRC] manager_set_order_status error", e);
      setMsg(e?.message || "Failed to update order status.");
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Status</h1>
      <p className="h2">Manager order queue (RLS-safe via RPC).</p>

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
              max="60"
              value={daysBack}
              onChange={(e) => setDaysBack(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <div className="small">Filter cooler</div>
            <select
              className="input"
              value={filterCooler}
              onChange={(e) => setFilterCooler(e.target.value)}
            >
              <option value="all">All coolers</option>
              {COOLERS.map((c) => (
                <option key={c.cooler_id} value={c.cooler_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 200 }}>
            <div className="small">Filter status</div>
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
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

      <div className="small" style={{ marginBottom: 8 }}>
        Showing <strong>{filtered.length}</strong> orders
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ borderRadius: 14 }}>
          <div className="small">No orders match the current filters.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((o) => {
            const items = normalizeItems(o.items);

            return (
              <div key={o.id} className="card" style={{ borderRadius: 14 }}>
                <div
                  className="row"
                  style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900 }}>
                      {coolerNameById.get(o.cooler_id) || o.cooler_id}
                    </div>

                    <div className="small" style={{ marginTop: 6 }}>
                      <span className="badge">{o.cooler_id}</span>{" "}
                      <span className="badge">{o.status}</span>
                    </div>

                    <div className="small" style={{ marginTop: 6 }}>
                      {fmtDate(o.created_at)} • <strong>{fmtMoney(o.total)}</strong>
                    </div>

                    {o.note ? (
                      <div className="small" style={{ marginTop: 8 }}>
                        <strong>Note:</strong> {o.note}
                      </div>
                    ) : null}

                    {items.length ? (
                      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                        {items.map((it, idx) => (
                          <div
                            key={`${o.id}_${idx}`}
                            className="row"
                            style={{ justifyContent: "space-between" }}
                          >
                            <span className="small">
                              {it.name || it.sku || "Item"}{" "}
                              {it.qty ? <span className="badge">x{it.qty}</span> : null}
                            </span>
                            <span className="small">
                              {it.price != null ? fmtMoney(it.price) : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ minWidth: 200 }}>
                    <div className="small" style={{ marginBottom: 6 }}>
                      Update status
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      <button
                        className="btn"
                        disabled={o.status === "placed"}
                        onClick={() => setStatus(o.id, "placed")}
                      >
                        Mark Placed
                      </button>

                      <button
                        className="btn btn-green"
                        disabled={o.status === "fulfilled"}
                        onClick={() => setStatus(o.id, "fulfilled")}
                      >
                        Mark Fulfilled
                      </button>

                      <button
                        className="btn"
                        disabled={o.status === "cancelled"}
                        onClick={() => setStatus(o.id, "cancelled")}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>
                  Order ID: {o.id}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <hr className="hr" />

      <div className="row">
        <Link to="/manager/analytics" className="btn btn-primary">
          Back to Analytics
        </Link>
        <Link to="/" className="btn">
          Exit Manager
        </Link>
      </div>
    </div>
  );
}
