// src/ManagerAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { COOLERS, ORANGE } from "./data.js";

/**
 * ManagerAnalytics.jsx
 * - Fixes your current build break:
 *   ✅ correct import path: "./supabaseClient" (because this file lives in src/)
 *
 * - Keeps logic defensive:
 *   ✅ does NOT assume intake_requests has a 'name' column
 *   ✅ shows useful errors on-screen if Supabase schema doesn't match
 *
 * NOTE:
 * - This file expects:
 *   - orders table with: created_at, cooler_id, quantity, total_amount (or total)
 *   - intake_requests table with: created_at, cooler_id, need (or category)
 *
 * If your column names differ, this file will surface the exact error in the UI,
 * and we’ll adjust precisely (no guessing).
 */

const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n || 0)
  );

const dayStartISO = (daysBack) => {
  if (!daysBack) return null;
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString();
};

const DATE_RANGES = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "all", label: "All time", days: null },
];

export default function ManagerAnalytics() {
  const [rangeId, setRangeId] = useState("7");
  const [loading, setLoading] = useState(false);

  const [ordersRows, setOrdersRows] = useState([]);
  const [helpRows, setHelpRows] = useState([]);

  const [ordersErr, setOrdersErr] = useState("");
  const [helpErr, setHelpErr] = useState("");

  const selectedRange = useMemo(
    () => DATE_RANGES.find((r) => r.id === rangeId) || DATE_RANGES[0],
    [rangeId]
  );

  const sinceISO = useMemo(
    () => dayStartISO(selectedRange.days),
    [selectedRange.days]
  );

  async function load() {
    setLoading(true);
    setOrdersErr("");
    setHelpErr("");

    // -----------------------
    // ORDERS (defensive)
    // -----------------------
    try {
      let q = supabase
        .from("orders")
        .select(
          "id, created_at, cooler_id, quantity, total_amount, total, amount"
        )
        .order("created_at", { ascending: false })
        .limit(2000);

      if (sinceISO) q = q.gte("created_at", sinceISO);

      const { data, error } = await q;
      if (error) throw error;
      setOrdersRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrdersRows([]);
      setOrdersErr(e?.message || String(e));
    }

    // -----------------------
    // HELP REQUESTS (defensive)
    // -----------------------
    try {
      let q = supabase
        .from("intake_requests")
        // Do NOT select columns that might not exist (like 'name')
        .select("id, created_at, cooler_id, need, category, details, status")
        .order("created_at", { ascending: false })
        .limit(2000);

      if (sinceISO) q = q.gte("created_at", sinceISO);

      const { data, error } = await q;
      if (error) throw error;
      setHelpRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setHelpRows([]);
      setHelpErr(e?.message || String(e));
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeId]);

  // -----------------------
  // Rollups (include zero coolers)
  // -----------------------
  const coolerIndex = useMemo(() => {
    const m = new Map();
    (COOLERS || []).forEach((c) => m.set(c.cooler_id, c));
    return m;
  }, []);

  const ordersByCooler = useMemo(() => {
    const base = (COOLERS || []).map((c) => ({
      cooler_id: c.cooler_id,
      name: c.name,
      orders: 0,
      items: 0,
      revenue: 0,
    }));

    const idx = new Map(base.map((b) => [b.cooler_id, b]));

    for (const r of ordersRows) {
      const cooler_id = r.cooler_id || "unknown";
      const row =
        idx.get(cooler_id) ||
        (() => {
          const fallback = {
            cooler_id,
            name: coolerIndex.get(cooler_id)?.name || cooler_id,
            orders: 0,
            items: 0,
            revenue: 0,
          };
          base.push(fallback);
          idx.set(cooler_id, fallback);
          return fallback;
        })();

      row.orders += 1;
      row.items += Number(r.quantity || 0);

      const amt =
        r.total_amount ?? r.total ?? r.amount ?? 0; // tolerate schema variants
      row.revenue += Number(amt || 0);
    }

    return base;
  }, [ordersRows, coolerIndex]);

  const helpByNeed = useMemo(() => {
    // counts by need/category, regardless of cooler selection
    const counts = new Map();
    for (const r of helpRows) {
      const key = r.need || r.category || "Unknown";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([need, count]) => ({ need, count }))
      .sort((a, b) => b.count - a.count);
  }, [helpRows]);

  const totals = useMemo(() => {
    const t = { orders: 0, items: 0, revenue: 0, help: helpRows.length };
    for (const c of ordersByCooler) {
      t.orders += c.orders;
      t.items += c.items;
      t.revenue += c.revenue;
    }
    return t;
  }, [ordersByCooler, helpRows.length]);

  // -----------------------
  // UI styles (matches your orange/green theme)
  // -----------------------
  const wrap = {
    minHeight: "100vh",
    background: ORANGE?.bg || "#FFF7ED",
    padding: 16,
    color: ORANGE?.text || "#111827",
  };

  const card = {
    background: ORANGE?.card || "#FFFFFF",
    border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
    marginBottom: 12,
  };

  const btn = (active) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${active ? "#14532d" : (ORANGE?.border || "#FED7AA")}`,
    background: active ? "#14532d" : "#fff",
    color: active ? "#fff" : "#111827",
    fontWeight: 800,
    textDecoration: "none",
    cursor: "pointer",
  });

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  };

  const th = {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: `1px solid ${ORANGE?.border || "#FED7AA"}`,
    fontWeight: 900,
    color: "#111827",
    whiteSpace: "nowrap",
  };

  const td = {
    padding: "10px 8px",
    borderBottom: `1px solid ${ORANGE?.border || "#FED7AA"}`,
    verticalAlign: "top",
  };

  return (
    <div style={wrap}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>
          Manager Analytics
        </h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link to="/coolers" style={btn(false)}>
            Back to Coolers
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 6, marginBottom: 12, opacity: 0.85 }}>
        View orders + help requests for the selected date range.
      </p>

      <div style={card}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DATE_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRangeId(r.id)}
              style={btn(rangeId === r.id)}
            >
              {r.label}
            </button>
          ))}

          <button
            type="button"
            onClick={load}
            style={{
              ...btn(false),
              marginLeft: "auto",
              border: `1px solid ${ORANGE?.accent || "#F97316"}`,
              color: ORANGE?.accent || "#F97316",
              fontWeight: 950,
            }}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 950 }}>
          Totals ({selectedRange.label})
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Orders</div>
            <div style={{ fontSize: 22, fontWeight: 950 }}>{totals.orders}</div>
          </div>

          <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Items</div>
            <div style={{ fontSize: 22, fontWeight: 950 }}>{totals.items}</div>
          </div>

          <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Revenue</div>
            <div style={{ fontSize: 22, fontWeight: 950 }}>
              {money(totals.revenue)}
            </div>
          </div>

          <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Help Requests</div>
            <div style={{ fontSize: 22, fontWeight: 950 }}>{totals.help}</div>
          </div>
        </div>

        {(ordersErr || helpErr) && (
          <div style={{ marginTop: 12 }}>
            {ordersErr && (
              <div style={{ marginBottom: 8, color: "#991b1b" }}>
                <strong>Orders query error:</strong> {ordersErr}
              </div>
            )}
            {helpErr && (
              <div style={{ color: "#991b1b" }}>
                <strong>Help query error:</strong> {helpErr}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={card}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 950 }}>
          Orders by Cooler
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Cooler</th>
                <th style={th}>Orders</th>
                <th style={th}>Items</th>
                <th style={th}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {ordersByCooler.map((c) => (
                <tr key={c.cooler_id}>
                  <td style={td}>
                    <div style={{ fontWeight: 900 }}>{c.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {c.cooler_id}
                    </div>
                  </td>
                  <td style={td}>{c.orders}</td>
                  <td style={td}>{c.items}</td>
                  <td style={td}>{money(c.revenue)}</td>
                </tr>
              ))}

              <tr>
                <td style={{ ...td, fontWeight: 950 }}>TOTAL</td>
                <td style={{ ...td, fontWeight: 950 }}>{totals.orders}</td>
                <td style={{ ...td, fontWeight: 950 }}>{totals.items}</td>
                <td style={{ ...td, fontWeight: 950 }}>
                  {money(totals.revenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 950 }}>
          Intake by Need (Help Requests)
        </h2>

        {helpRows.length === 0 && !helpErr ? (
          <div style={{ opacity: 0.8 }}>
            No help requests found for this range.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Need</th>
                  <th style={th}>Count</th>
                </tr>
              </thead>
              <tbody>
                {helpByNeed.map((r) => (
                  <tr key={r.need}>
                    <td style={td} title={r.need}>
                      {r.need}
                    </td>
                    <td style={td}>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ opacity: 0.7, fontSize: 12, marginTop: 10 }}>
        If a Supabase error appears above, copy the exact message — we’ll adjust
        only the columns/tables involved.
      </div>
    </div>
  );
}
