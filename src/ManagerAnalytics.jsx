// src/pages/ManagerAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { COOLERS, ORANGE } from "../data.js";

// Use your real API layer
import { listOrders, listIntakeRequests } from "../lib/ordersApi.js";

const DATE_RANGES = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "all", label: "All time", days: null },
];

function safeNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function fmtMoney(amount) {
  const n = safeNumber(amount);
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function fmtISODate(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString();
}

/**
 * Best-effort timestamp resolver for an order/intake record.
 */
function getRecordDate(rec) {
  if (!rec || typeof rec !== "object") return null;

  const candidates = [
    rec.created_at,
    rec.createdAt,
    rec.submitted_at,
    rec.submittedAt,
    rec.timestamp,
    rec.time,
    rec.date,
  ].filter(Boolean);

  for (const c of candidates) {
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const id = String(rec.id ?? rec.order_id ?? rec.orderId ?? "");
  const match = id.match(/local[_#]?(\d{12,})/i);
  if (match?.[1]) {
    const ms = Number(match[1]);
    if (Number.isFinite(ms)) {
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  return null;
}

function calcOrderRevenue(order) {
  if (!order || typeof order !== "object") return 0;

  const direct =
    order.total ??
    order.total_amount ??
    order.totalAmount ??
    order.amount ??
    order.revenue;

  if (direct != null && direct !== "") return safeNumber(direct);

  const items = Array.isArray(order.items) ? order.items : [];
  return items.reduce((sum, it) => {
    const price = safeNumber(it.price ?? it.unit_price ?? it.unitPrice);
    const qty = safeNumber(it.qty ?? it.quantity ?? 1) || 1;
    return sum + price * qty;
  }, 0);
}

/* ---------------- CSV helpers ---------------- */

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  // Escape quotes and wrap if it contains comma/newline/quote
  const needs = /[,"\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needs ? `"${escaped}"` : escaped;
}

function rowsToCsv(headers, rows) {
  const lines = [];
  lines.push(headers.map(csvEscape).join(","));
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape(r[h])).join(","));
  }
  return lines.join("\n");
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function safeSlug(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/* ---------------- Component ---------------- */

export default function ManagerAnalytics() {
  const navigate = useNavigate();

  const [rangeId, setRangeId] = useState("all");
  const [orders, setOrders] = useState([]);
  const [intake, setIntake] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const activeRange = useMemo(
    () => DATE_RANGES.find((r) => r.id === rangeId) || DATE_RANGES[2],
    [rangeId]
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const [ordersRes, intakeRes] = await Promise.all([
          listOrders(),
          typeof listIntakeRequests === "function"
            ? listIntakeRequests()
            : Promise.resolve({ ok: true, data: [] }),
        ]);

        if (!alive) return;

        if (!ordersRes?.ok) {
          setErrorMsg(ordersRes?.error || "Could not load orders.");
          setOrders([]);
        } else {
          setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        }

        if (!intakeRes?.ok) {
          setIntake([]);
        } else {
          setIntake(Array.isArray(intakeRes.data) ? intakeRes.data : []);
        }
      } catch (err) {
        if (!alive) return;
        setErrorMsg("Could not load analytics. Check your API routes and console.");
        setOrders([]);
        setIntake([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const days = activeRange.days;

    if (!days) {
      return { orders: orders || [], intake: intake || [] };
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const keepAfter = (rec) => {
      const d = getRecordDate(rec);
      if (!d) return false;
      return d >= cutoff;
    };

    return {
      orders: (orders || []).filter(keepAfter),
      intake: (intake || []).filter(keepAfter),
    };
  }, [orders, intake, activeRange.days]);

  const perCooler = useMemo(() => {
    const base = COOLERS.map((c) => ({
      cooler_id: c.cooler_id,
      name: c.name,
      address: c.address,
      ordersCount: 0,
      revenue: 0,
      intakeCount: 0,
    }));

    const byId = new Map(base.map((x) => [x.cooler_id, x]));

    for (const o of filtered.orders) {
      const coolerId = String(o.cooler_id ?? o.coolerId ?? o.cooler ?? "");
      if (!coolerId) continue;
      const row = byId.get(coolerId);
      if (!row) continue;

      row.ordersCount += 1;
      row.revenue += calcOrderRevenue(o);
    }

    for (const r of filtered.intake) {
      const coolerId = String(r.cooler_id ?? r.coolerId ?? r.cooler ?? "");
      if (!coolerId) continue;
      const row = byId.get(coolerId);
      if (!row) continue;

      row.intakeCount += 1;
    }

    return base;
  }, [filtered.orders, filtered.intake]);

  const totals = useMemo(() => {
    return perCooler.reduce(
      (acc, r) => {
        acc.orders += r.ordersCount;
        acc.revenue += r.revenue;
        acc.intake += r.intakeCount;
        return acc;
      },
      { orders: 0, revenue: 0, intake: 0 }
    );
  }, [perCooler]);

  function exportCsv() {
    const stamp = new Date();
    const stampKey = `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(stamp.getDate()).padStart(2, "0")}_${String(stamp.getHours()).padStart(
      2,
      "0"
    )}${String(stamp.getMinutes()).padStart(2, "0")}`;
    const rangeKey = safeSlug(activeRange.label);

    // A) Summary (per cooler)
    const summaryHeaders = [
      "cooler_id",
      "name",
      "address",
      "orders",
      "revenue",
      "intake_requests",
    ];
    const summaryRows = perCooler.map((c) => ({
      cooler_id: c.cooler_id,
      name: c.name,
      address: c.address,
      orders: c.ordersCount,
      revenue: c.revenue.toFixed(2),
      intake_requests: c.intakeCount,
    }));
    downloadTextFile(
      `harc_analytics_summary_${rangeKey}_${stampKey}.csv`,
      rowsToCsv(summaryHeaders, summaryRows)
    );

    // B) Orders (raw)
    const orderHeaders = [
      "id",
      "created_at",
      "cooler_id",
      "cooler_name",
      "items_count",
      "subtotal",
      "tax",
      "total",
      "computed_revenue",
    ];

    const coolerNameById = new Map(COOLERS.map((c) => [c.cooler_id, c.name]));

    const orderRows = (filtered.orders || []).map((o) => {
      const id = o.id ?? o.order_id ?? o.orderId ?? "";
      const d = getRecordDate(o);
      const coolerId = String(o.cooler_id ?? o.coolerId ?? o.cooler ?? "");
      const items = Array.isArray(o.items) ? o.items : [];
      const computedRevenue = calcOrderRevenue(o);

      // If your order schema includes totals, capture them; else blank
      const subtotal = o.subtotal ?? o.sub_total ?? "";
      const tax = o.tax ?? "";
      const total = o.total ?? o.total_amount ?? o.totalAmount ?? "";

      return {
        id,
        created_at: fmtISODate(d || o.created_at || o.createdAt || ""),
        cooler_id: coolerId,
        cooler_name: coolerNameById.get(coolerId) || "",
        items_count: items.length,
        subtotal: subtotal === "" ? "" : safeNumber(subtotal).toFixed(2),
        tax: tax === "" ? "" : safeNumber(tax).toFixed(2),
        total: total === "" ? "" : safeNumber(total).toFixed(2),
        computed_revenue: safeNumber(computedRevenue).toFixed(2),
      };
    });

    downloadTextFile(
      `harc_analytics_orders_${rangeKey}_${stampKey}.csv`,
      rowsToCsv(orderHeaders, orderRows)
    );

    // C) Intake (raw) — only if present
    const intakeHeaders = [
      "id",
      "created_at",
      "cooler_id",
      "cooler_name",
      "status",
      "name",
      "phone",
      "email",
      "notes",
    ];

    const intakeRows = (filtered.intake || []).map((r) => {
      const id = r.id ?? r.intake_id ?? r.request_id ?? "";
      const d = getRecordDate(r);
      const coolerId = String(r.cooler_id ?? r.coolerId ?? r.cooler ?? "");
      return {
        id,
        created_at: fmtISODate(d || r.created_at || r.createdAt || ""),
        cooler_id: coolerId,
        cooler_name: coolerNameById.get(coolerId) || "",
        status: r.status ?? "",
        name: r.name ?? r.full_name ?? "",
        phone: r.phone ?? "",
        email: r.email ?? "",
        notes: r.notes ?? r.comment ?? "",
      };
    });

    downloadTextFile(
      `harc_analytics_intake_${rangeKey}_${stampKey}.csv`,
      rowsToCsv(intakeHeaders, intakeRows)
    );
  }

  return (
    <div style={{ background: ORANGE.bg, minHeight: "100vh", padding: 20 }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          background: ORANGE.card,
          border: `1px solid ${ORANGE.border}`,
          borderRadius: 16,
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, color: ORANGE.text }}>Manager Analytics</h1>
            <div style={{ marginTop: 6, color: "#6B7280" }}>
              Date range: <strong>{activeRange.label}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Segmented value={rangeId} onChange={setRangeId} options={DATE_RANGES} />

            <button
              onClick={exportCsv}
              disabled={loading}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${ORANGE.border}`,
                background: loading ? "#F3F4F6" : ORANGE.accent,
                color: loading ? "#6B7280" : "#fff",
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title={loading ? "Wait for data to load" : "Download CSV exports"}
            >
              Export CSV
            </button>

            <button
              onClick={() => navigate("/manager")}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${ORANGE.border}`,
                background: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            background: "#FFF7ED",
            border: `1px solid ${ORANGE.border}`,
          }}
        >
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Kpi label="Total Orders" value={totals.orders} />
            <Kpi label="Total Revenue" value={fmtMoney(totals.revenue)} />
            <Kpi label="Total Intake Requests" value={totals.intake} />
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 18, color: "#6B7280" }}>Loading analytics…</div>
        ) : errorMsg ? (
          <div
            style={{
              marginTop: 18,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #FCA5A5",
              background: "#FEF2F2",
              color: "#991B1B",
              fontWeight: 700,
            }}
          >
            {errorMsg}
          </div>
        ) : (
          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            {perCooler.map((c) => (
              <div
                key={c.cooler_id}
                style={{
                  border: `1px solid ${ORANGE.border}`,
                  borderRadius: 14,
                  padding: 16,
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: ORANGE.text }}>{c.name}</div>
                <div style={{ color: "#6B7280", marginTop: 4 }}>{c.address}</div>

                <div style={{ marginTop: 12, display: "grid", gap: 6, maxWidth: 420 }}>
                  <Row label="Orders" value={c.ordersCount} strong />
                  <Row label="Revenue" value={fmtMoney(c.revenue)} strong />
                  <Row label="Intake Requests" value={c.intakeCount} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 18, color: "#6B7280" }}>
          <Link
            to="/"
            style={{
              color: ORANGE.accent,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function Segmented({ value, onChange, options }) {
  return (
    <div
      style={{
        display: "flex",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              padding: "10px 12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 900,
              background: active ? ORANGE.accent : "#fff",
              color: active ? "#fff" : ORANGE.text,
            }}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div style={{ minWidth: 180 }}>
      <div style={{ color: "#6B7280", fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: ORANGE.text }}>{value}</div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
      <div style={{ color: "#6B7280", fontWeight: strong ? 900 : 700 }}>{label}</div>
      <div style={{ fontWeight: strong ? 900 : 800, color: ORANGE.text }}>{value}</div>
    </div>
  );
}
