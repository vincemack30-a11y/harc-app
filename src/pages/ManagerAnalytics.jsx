import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { COOLERS, ORANGE } from "../data";
import { Download, RefreshCw, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * ManagerAnalytics
 *
 * IMPORTANT:
 * - Uses canonical `cooler_id` from COOLERS so we can show “zero” coolers.
 * - Pulls daily rollups from views:
 *    - v_orders_daily_counts
 *    - v_intake_daily_counts
 *
 * Assumptions:
 * - Each view returns: day (YYYY-MM-DD), cooler_id (text), orders/items/revenue OR intake_requests
 *
 * Behavior:
 * - Default behavior INCLUDES zero-activity coolers in tables/top lists (so you can audit all coolers).
 * - You can toggle “Show zero-activity coolers” OFF to focus only on active coolers.
 */

function formatMoney(n) {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
}

function safeDayString(d) {
  // Expect YYYY-MM-DD
  if (!d) return "";
  return String(d).slice(0, 10);
}

function toISODateInputValue(date) {
  // date is a Date object
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayISO() {
  return toISODateInputValue(new Date());
}

function daysAgoISO(n) {
  const dt = new Date();
  dt.setDate(dt.getDate() - n);
  return toISODateInputValue(dt);
}

export default function ManagerAnalytics({ unlocked, onBackToCustomer }) {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Default date range: last 30 days
  const [startDate, setStartDate] = useState(daysAgoISO(30));
  const [endDate, setEndDate] = useState(todayISO());

  const [showZeros, setShowZeros] = useState(true);

  // Raw daily rows from views
  const [ordersDaily, setOrdersDaily] = useState([]); // [{ day, cooler_id, orders, items, revenue }]
  const [intakeDaily, setIntakeDaily] = useState([]); // [{ day, cooler_id, intake_requests }]

  // --- Load ---
  const loadAnalytics = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      // Orders daily
      const { data: od, error: odErr } = await supabase
        .from("v_orders_daily_counts")
        .select("*")
        .gte("day", startDate)
        .lte("day", endDate);

      if (odErr) throw odErr;

      // Intake daily
      const { data: id, error: idErr } = await supabase
        .from("v_intake_daily_counts")
        .select("*")
        .gte("day", startDate)
        .lte("day", endDate);

      if (idErr) throw idErr;

      setOrdersDaily(Array.isArray(od) ? od : []);
      setIntakeDaily(Array.isArray(id) ? id : []);
    } catch (e) {
      console.error("ManagerAnalytics load error:", e);
      setErrMsg(
        e?.message ||
          "Analytics load failed (check Supabase views + RLS + env vars)."
      );
      setOrdersDaily([]);
      setIntakeDaily([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  // --- Normalize: aggregate by cooler_id across date range ---
  const byCooler = useMemo(() => {
    const base = COOLERS.map((c) => ({
      cooler_id: c.cooler_id,
      cooler_name: c.name,
      cooler_address: c.address,
      orders: 0,
      items: 0,
      revenue: 0,
      intake_requests: 0,
    }));

    const idx = new Map(base.map((r) => [r.cooler_id, r]));

    for (const r of ordersDaily || []) {
      const cid = r?.cooler_id;
      if (!cid) continue;
      const row = idx.get(cid);
      if (!row) continue;
      row.orders += Number(r?.orders || 0);
      row.items += Number(r?.items || 0);
      row.revenue += Number(r?.revenue || 0);
    }

    for (const r of intakeDaily || []) {
      const cid = r?.cooler_id;
      if (!cid) continue;
      const row = idx.get(cid);
      if (!row) continue;
      row.intake_requests += Number(r?.intake_requests || 0);
    }

    const rows = Array.from(idx.values());

    return showZeros
      ? rows
      : rows.filter(
          (r) =>
            r.orders > 0 || r.items > 0 || r.revenue > 0 || r.intake_requests > 0
        );
  }, [ordersDaily, intakeDaily, showZeros]);

  const totals = useMemo(() => {
    return byCooler.reduce(
      (acc, r) => {
        acc.orders += Number(r.orders || 0);
        acc.items += Number(r.items || 0);
        acc.revenue += Number(r.revenue || 0);
        acc.intake_requests += Number(r.intake_requests || 0);
        return acc;
      },
      { orders: 0, items: 0, revenue: 0, intake_requests: 0 }
    );
  }, [byCooler]);

  const topRevenueCooler = useMemo(() => {
    if (!byCooler.length) return null;
    return [...byCooler].sort((a, b) => b.revenue - a.revenue)[0];
  }, [byCooler]);

  const topOrdersCooler = useMemo(() => {
    if (!byCooler.length) return null;
    return [...byCooler].sort((a, b) => b.orders - a.orders)[0];
  }, [byCooler]);

  const topItemsCooler = useMemo(() => {
    if (!byCooler.length) return null;
    return [...byCooler].sort((a, b) => b.items - a.items)[0];
  }, [byCooler]);

  const topIntakeCooler = useMemo(() => {
    if (!byCooler.length) return null;
    return [...byCooler].sort((a, b) => b.intake_requests - a.intake_requests)[0];
  }, [byCooler]);

  // --- Daily rows table (optional) ---
  const ordersDailySorted = useMemo(() => {
    const rows = Array.isArray(ordersDaily) ? [...ordersDaily] : [];
    rows.sort((a, b) => safeDayString(a.day).localeCompare(safeDayString(b.day)));
    return rows;
  }, [ordersDaily]);

  const intakeDailySorted = useMemo(() => {
    const rows = Array.isArray(intakeDaily) ? [...intakeDaily] : [];
    rows.sort((a, b) => safeDayString(a.day).localeCompare(safeDayString(b.day)));
    return rows;
  }, [intakeDaily]);

  // --- CSV export ---
  const downloadCSV = (filename, rows) => {
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            // escape quotes
            const escaped = s.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  const exportByCoolerCSV = () => {
    const header = [
      "cooler_id",
      "cooler_name",
      "cooler_address",
      "orders",
      "items",
      "revenue",
      "intake_requests",
    ];
    const rows = [
      header,
      ...byCooler.map((r) => [
        r.cooler_id,
        r.cooler_name,
        r.cooler_address,
        r.orders,
        r.items,
        Number(r.revenue || 0).toFixed(2),
        r.intake_requests,
      ]),
      [
        "TOTALS",
        "",
        "",
        totals.orders,
        totals.items,
        Number(totals.revenue || 0).toFixed(2),
        totals.intake_requests,
      ],
    ];

    downloadCSV(
      `harc_manager_by_cooler_${startDate}_to_${endDate}.csv`,
      rows
    );
  };

  const exportOrdersDailyCSV = () => {
    const header = ["day", "cooler_id", "orders", "items", "revenue"];
    const rows = [
      header,
      ...ordersDailySorted.map((r) => [
        safeDayString(r.day),
        r.cooler_id,
        Number(r.orders || 0),
        Number(r.items || 0),
        Number(r.revenue || 0).toFixed(2),
      ]),
    ];
    downloadCSV(
      `harc_orders_daily_${startDate}_to_${endDate}.csv`,
      rows
    );
  };

  const exportIntakeDailyCSV = () => {
    const header = ["day", "cooler_id", "intake_requests"];
    const rows = [
      header,
      ...intakeDailySorted.map((r) => [
        safeDayString(r.day),
        r.cooler_id,
        Number(r.intake_requests || 0),
      ]),
    ];
    downloadCSV(
      `harc_intake_daily_${startDate}_to_${endDate}.csv`,
      rows
    );
  };

  // --- UI bits ---
  const Card = ({ children, style }) => (
    <div
      style={{
        background: ORANGE.card,
        border: `1px solid ${ORANGE.border}`,
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );

  const Button = ({ children, onClick, disabled, icon: Icon, style }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 12,
        padding: "10px 12px",
        border: `1px solid ${ORANGE.border}`,
        background: disabled ? "#FFF" : "#FFF",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );

  if (!unlocked) {
    return (
      <div style={{ padding: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Lock size={18} />
            <div style={{ fontWeight: 900, fontSize: 18 }}>Locked</div>
          </div>
          <div style={{ marginTop: 10, opacity: 0.85 }}>
            Go to Manager and unlock first.
          </div>
          <div style={{ marginTop: 12 }}>
            <Link
              to="/manager"
              style={{ fontWeight: 900, textDecoration: "none" }}
            >
              Go to Manager
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}>Manager Analytics</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {typeof onBackToCustomer === "function" ? (
            <Button
              icon={ArrowLeft}
              onClick={onBackToCustomer}
              style={{ borderColor: ORANGE.border }}
            >
              Back to Customer
            </Button>
          ) : null}

          <Button
            icon={RefreshCw}
            onClick={loadAnalytics}
            disabled={loading}
            style={{ borderColor: ORANGE.border }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            icon={Download}
            onClick={exportByCoolerCSV}
            disabled={loading}
            style={{ borderColor: ORANGE.border }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
        Rollups by cooler (toggle to include/exclude zero-activity coolers).
      </div>

      {errMsg ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#991b1b",
            fontWeight: 700,
          }}
        >
          {errMsg}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <Card>
          <div style={{ fontWeight: 900, opacity: 0.75, fontSize: 12 }}>
            Date From
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 12,
              padding: 10,
              border: `1px solid ${ORANGE.border}`,
            }}
          />
        </Card>

        <Card>
          <div style={{ fontWeight: 900, opacity: 0.75, fontSize: 12 }}>
            Date To
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 12,
              padding: 10,
              border: `1px solid ${ORANGE.border}`,
            }}
          />
        </Card>

        <Card>
          <div style={{ fontWeight: 900, opacity: 0.75, fontSize: 12 }}>
            Options
          </div>
          <label
            style={{
              marginTop: 10,
              display: "flex",
              gap: 10,
              alignItems: "center",
              fontWeight: 800,
            }}
          >
            <input
              type="checkbox"
              checked={showZeros}
              onChange={(e) => setShowZeros(e.target.checked)}
            />
            Show zero-activity coolers
          </label>

          <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
            Note: Use Refresh after changing dates.
          </div>
        </Card>
      </div>

      {/* Totals cards */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <Card style={{ borderColor: "#bbf7d0" }}>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Total Orders
          </div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{totals.orders}</div>
        </Card>

        <Card style={{ borderColor: "#bbf7d0" }}>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Total Items
          </div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{totals.items}</div>
        </Card>

        <Card style={{ borderColor: "#bbf7d0" }}>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Total Revenue
          </div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            {formatMoney(totals.revenue)}
          </div>
        </Card>

        <Card style={{ borderColor: "#bbf7d0" }}>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Total Intake Requests
          </div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            {totals.intake_requests}
          </div>
        </Card>
      </div>

      {/* Top coolers */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        <Card>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Top Revenue Cooler
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>
            {topRevenueCooler ? topRevenueCooler.cooler_name : "—"}
          </div>
          <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
            {topRevenueCooler ? formatMoney(topRevenueCooler.revenue) : "—"}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Top Orders Cooler
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>
            {topOrdersCooler ? topOrdersCooler.cooler_name : "—"}
          </div>
          <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
            {topOrdersCooler ? topOrdersCooler.orders : "—"}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Top Items Cooler
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>
            {topItemsCooler ? topItemsCooler.cooler_name : "—"}
          </div>
          <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
            {topItemsCooler ? topItemsCooler.items : "—"}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 900, opacity: 0.7, fontSize: 12 }}>
            Top Intake Cooler
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>
            {topIntakeCooler ? topIntakeCooler.cooler_name : "—"}
          </div>
          <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
            {topIntakeCooler ? topIntakeCooler.intake_requests : "—"}
          </div>
        </Card>
      </div>

      {/* By cooler table */}
      <div style={{ marginTop: 12 }}>
        <Card>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            By Cooler {showZeros ? "(includes zeros)" : "(zeros excluded)"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Range: {startDate} → {endDate}
          </div>

          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.8 }}>
                  <th style={{ padding: "10px 8px" }}>Cooler</th>
                  <th style={{ padding: "10px 8px" }}>Orders</th>
                  <th style={{ padding: "10px 8px" }}>Items</th>
                  <th style={{ padding: "10px 8px" }}>Revenue</th>
                  <th style={{ padding: "10px 8px" }}>Intake</th>
                </tr>
              </thead>
              <tbody>
                {byCooler.map((r) => (
                  <tr
                    key={r.cooler_id}
                    style={{ borderTop: `1px solid ${ORANGE.border}` }}
                  >
                    <td style={{ padding: "10px 8px" }}>
                      <div style={{ fontWeight: 900 }}>{r.cooler_name}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        ID: {r.cooler_id}
                      </div>
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 900 }}>
                      {r.orders}
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 900 }}>
                      {r.items}
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 900 }}>
                      {formatMoney(r.revenue)}
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 900 }}>
                      {r.intake_requests}
                    </td>
                  </tr>
                ))}

                <tr
                  style={{
                    borderTop: `2px solid ${ORANGE.border}`,
                    fontWeight: 900,
                  }}
                >
                  <td style={{ padding: "10px 8px" }}>Totals</td>
                  <td style={{ padding: "10px 8px" }}>{totals.orders}</td>
                  <td style={{ padding: "10px 8px" }}>{totals.items}</td>
                  <td style={{ padding: "10px 8px" }}>
                    {formatMoney(totals.revenue)}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {totals.intake_requests}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button icon={Download} onClick={exportByCoolerCSV} disabled={loading}>
              Export By-Cooler CSV
            </Button>
            <Button icon={Download} onClick={exportOrdersDailyCSV} disabled={loading}>
              Export Orders Daily CSV
            </Button>
            <Button icon={Download} onClick={exportIntakeDailyCSV} disabled={loading}>
              Export Intake Daily CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
