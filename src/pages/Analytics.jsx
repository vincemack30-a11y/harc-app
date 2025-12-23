import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function toISODate(d) {
  // returns YYYY-MM-DD in local time
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function downloadText(filename, text, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Analytics({ ctx }) {
  const { COOLERS = [] } = ctx || {};

  // default: last 7 days
  const today = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => toISODate(today), [today]);
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return toISODate(d);
  }, []);

  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);

  const [rows, setRows] = useState([]); // RPC results
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const totals = useMemo(() => {
    const t = rows.reduce(
      (acc, r) => {
        acc.orders += Number(r.orders_count || 0);
        acc.sales += Number(r.sales_total || 0);
        acc.items += Number(r.items_sold || 0);
        return acc;
      },
      { orders: 0, sales: 0, items: 0 }
    );
    return t;
  }, [rows]);

  async function fetchAnalytics() {
    setMsg("");
    setLoading(true);

    try {
      // RLS-safe: use SECURITY DEFINER RPC
      const { data, error } = await supabase.rpc("get_manager_analytics_range", {
        date_from: dateFrom,
        date_to: dateTo,
      });

      if (error) throw error;

      // data shape expected:
      // [{ cooler_id, cooler_name, orders_count, sales_total, items_sold }, ...]
      setRows(Array.isArray(data) ? data : []);
      if (!data || data.length === 0) {
        setMsg("No results returned for this range (or no coolers table rows).");
      }
    } catch (e) {
      console.error("[HaRC] analytics rpc error", e);
      setMsg(e?.message || "Analytics failed. Check RPC + grants + schema.");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const header = ["cooler_id", "cooler_name", "orders_count", "sales_total", "items_sold"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          JSON.stringify(r.cooler_id ?? ""),
          JSON.stringify(r.cooler_name ?? ""),
          Number(r.orders_count || 0),
          Number(r.sales_total || 0).toFixed(2),
          Number(r.items_sold || 0),
        ].join(",")
      ),
      // totals row
      ["", "TOTAL", totals.orders, totals.sales.toFixed(2), totals.items].join(","),
    ];

    downloadText(`harc_analytics_${dateFrom}_to_${dateTo}.csv`, lines.join("\n"));
  }

  return (
    <div className="card">
      <h1 className="h1">Analytics</h1>
      <p className="h2">
        Manager view (RLS-safe). Data loads via RPC (not direct table reads).
      </p>

      <hr className="hr" />

      <div className="card" style={{ borderRadius: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Date Range</div>

        <div className="row" style={{ alignItems: "center" }}>
          <div style={{ minWidth: 220 }}>
            <div className="small">Date from</div>
            <input
              className="input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <div className="small">Date to</div>
            <input
              className="input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={fetchAnalytics} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button className="btn" onClick={exportCSV} disabled={loading || rows.length === 0}>
            Export CSV
          </button>
        </div>

        {msg ? (
          <div className="small" style={{ marginTop: 10 }}>
            {msg}
          </div>
        ) : null}
      </div>

      <hr className="hr" />

      <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="card" style={{ borderRadius: 14, minWidth: 220 }}>
          <div className="small">Total Orders</div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>{totals.orders}</div>
        </div>

        <div className="card" style={{ borderRadius: 14, minWidth: 220 }}>
          <div className="small">Total Sales</div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>${totals.sales.toFixed(2)}</div>
        </div>

        <div className="card" style={{ borderRadius: 14, minWidth: 220 }}>
          <div className="small">Items Sold</div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>{totals.items}</div>
        </div>
      </div>

      <hr className="hr" />

      <div className="card" style={{ borderRadius: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Per-Cooler Summary</div>

        {rows.length === 0 ? (
          <div className="small">
            No analytics loaded yet. Click <strong>Refresh</strong>.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {rows.map((r) => (
              <div
                key={r.cooler_id}
                className="row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "white",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {r.cooler_name || r.cooler_id}
                  </div>
                  <div className="small">
                    <span className="badge">{r.cooler_id}</span>
                  </div>
                </div>

                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <span className="pill">
                    Orders: <strong>{Number(r.orders_count || 0)}</strong>
                  </span>
                  <span className="pill">
                    Sales: <strong>${Number(r.sales_total || 0).toFixed(2)}</strong>
                  </span>
                  <span className="pill">
                    Items: <strong>{Number(r.items_sold || 0)}</strong>
                  </span>
                </div>
              </div>
            ))}

            <div
              className="row"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                border: "2px solid var(--border)",
                borderRadius: 12,
                background: "var(--bg)",
                marginTop: 6,
              }}
            >
              <div style={{ fontWeight: 900 }}>TOTAL</div>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <span className="pill">
                  Orders: <strong>{totals.orders}</strong>
                </span>
                <span className="pill">
                  Sales: <strong>${totals.sales.toFixed(2)}</strong>
                </span>
                <span className="pill">
                  Items: <strong>{totals.items}</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="hr" />

      <div className="row">
        <Link to="/manager/status" className="btn btn-green">
          Status
        </Link>
        <Link to="/" className="btn">
          Exit Manager
        </Link>
      </div>

      {/* Optional: quick reference list from local config */}
      {COOLERS?.length ? (
        <>
          <hr className="hr" />
          <div className="small">
            Local config coolers loaded: {COOLERS.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
