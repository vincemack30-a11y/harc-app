// src/pages/Manager.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { COOLERS, ORANGE } from "../data.js";

/**
 * Manager.jsx
 * - PIN unlock via Supabase RPC: public.manager_unlock(pin text) -> boolean
 * - Analytics reads from views if available:
 *     - public.v_orders_daily_counts (day, cooler_id, orders, revenue)
 *     - public.v_intake_daily_counts (day, cooler_id, intakes)  (optional)
 * - Weekly rollups are computed in JS (no dependency on a weekly DB view)
 *
 * IMPORTANT:
 * - Default behavior EXCLUDES zero-activity coolers from tables/top lists.
 * - You can toggle “Show zero-activity coolers” ON if you want to audit all.
 */

const TABS = ["analytics", "orders", "help", "restock"];
const DATE_RANGES = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "all", label: "All time" },
];

const LS_KEY = "harc_manager_unlocked_v1";

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const startOfWeekISO = (isoDateStr) => {
  const d = new Date(`${isoDateStr}T00:00:00`);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - diffToMonday);
  return toISODate(d);
};

const fmtMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const fmtInt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

const coolerLabel = (cooler_id) => {
  const c = COOLERS.find((x) => x.cooler_id === cooler_id);
  return c ? c.name : cooler_id;
};

const coolerAddress = (cooler_id) => {
  const c = COOLERS.find((x) => x.cooler_id === cooler_id);
  return c ? c.address : "";
};

const buttonBase = {
  border: `1px solid ${ORANGE.border}`,
  background: ORANGE.card,
  color: ORANGE.text,
  borderRadius: 12,
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

const pillBase = {
  border: `1px solid ${ORANGE.border}`,
  background: ORANGE.card,
  color: ORANGE.text,
  borderRadius: 999,
  padding: "8px 10px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
};

function downloadCSV(filename, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Manager() {
  const [tab, setTab] = useState("analytics");

  // Unlock state
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  // Analytics state
  const [rangeId, setRangeId] = useState("30");
  const [showZeros, setShowZeros] = useState(false); // default: exclude zeros
  const [loading, setLoading] = useState(false);
  const [ordersDaily, setOrdersDaily] = useState([]);
  const [intakeDaily, setIntakeDaily] = useState([]);
  const [loadError, setLoadError] = useState("");

  // Other tabs (safe placeholders)
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentHelp, setRecentHelp] = useState([]);
  const [recentRestock, setRecentRestock] = useState([]);

  const startDate = useMemo(() => {
    if (rangeId === "all") return null;
    const days = Number(rangeId);
    const d = new Date();
    d.setDate(d.getDate() - (days - 1));
    return toISODate(d);
  }, [rangeId]);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "true") setUnlocked(true);
  }, []);

  const handleUnlock = async (e) => {
    e?.preventDefault?.();
    setUnlockError("");
    setUnlocking(true);

    try {
      const cleaned = String(pin || "").trim();
      if (!cleaned) {
        setUnlockError("Enter your manager PIN.");
        return;
      }

      const { data, error } = await supabase.rpc("manager_unlock", {
        pin: cleaned,
      });

      if (error) throw error;

      const ok = data === true;
      if (!ok) {
        setUnlockError("Invalid PIN.");
        return;
      }

      setUnlocked(true);
      localStorage.setItem(LS_KEY, "true");
      setPin("");
    } catch (err) {
      setUnlockError(err?.message || "Unlock failed.");
    } finally {
      setUnlocking(false);
    }
  };

  const handleLock = () => {
    localStorage.removeItem(LS_KEY);
    setUnlocked(false);
    setTab("analytics");
  };

  const loadAnalytics = async () => {
    setLoading(true);
    setLoadError("");

    try {
      let q1 = supabase
        .from("v_orders_daily_counts")
        .select("day,cooler_id,orders,revenue")
        .order("day", { ascending: true });

      if (startDate) q1 = q1.gte("day", startDate);

      const { data: od, error: e1 } = await q1;
      if (e1) throw e1;

      setOrdersDaily(Array.isArray(od) ? od : []);

      // Intake view is optional
      let intake = [];
      const q2 = supabase
        .from("v_intake_daily_counts")
        .select("day,cooler_id,intakes")
        .order("day", { ascending: true });

      const q2f = startDate ? q2.gte("day", startDate) : q2;

      const { data: id, error: e2 } = await q2f;
      if (!e2 && Array.isArray(id)) intake = id;
      setIntakeDaily(intake);
    } catch (err) {
      setLoadError(err?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  const loadOperational = async () => {
    try {
      const { data: o, error: eo } = await supabase
        .from("orders")
        .select("id,created_at,cooler_id,total,status")
        .order("created_at", { ascending: false })
        .limit(25);
      if (!eo && Array.isArray(o)) setRecentOrders(o);

      const { data: h, error: eh } = await supabase
        .from("help_requests")
        .select("id,created_at,cooler_id,need,phone,status")
        .order("created_at", { ascending: false })
        .limit(25);
      if (!eh && Array.isArray(h)) setRecentHelp(h);

      const { data: r, error: er } = await supabase
        .from("restock_requests")
        .select("id,created_at,cooler_id,items_needed,status")
        .order("created_at", { ascending: false })
        .limit(25);
      if (!er && Array.isArray(r)) setRecentRestock(r);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    loadAnalytics();
    loadOperational();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, rangeId]);

  const ordersByCooler = useMemo(() => {
    const base = {};
    for (const c of COOLERS) base[c.cooler_id] = { orders: 0, revenue: 0 };

    for (const row of ordersDaily) {
      const id = row.cooler_id;
      if (!base[id]) base[id] = { orders: 0, revenue: 0 };
      base[id].orders += Number(row.orders || 0);
      base[id].revenue += Number(row.revenue || 0);
    }
    return base;
  }, [ordersDaily]);

  const intakeByCooler = useMemo(() => {
    const base = {};
    for (const c of COOLERS) base[c.cooler_id] = { intakes: 0 };

    for (const row of intakeDaily) {
      const id = row.cooler_id;
      if (!base[id]) base[id] = { intakes: 0 };
      base[id].intakes += Number(row.intakes || 0);
    }
    return base;
  }, [intakeDaily]);

  const totals = useMemo(() => {
    let orders = 0;
    let revenue = 0;
    for (const id of Object.keys(ordersByCooler)) {
      orders += Number(ordersByCooler[id].orders || 0);
      revenue += Number(ordersByCooler[id].revenue || 0);
    }
    let intakes = 0;
    for (const id of Object.keys(intakeByCooler)) {
      intakes += Number(intakeByCooler[id].intakes || 0);
    }
    return { orders, revenue, intakes };
  }, [ordersByCooler, intakeByCooler]);

  const dailySeries = useMemo(() => {
    const m = new Map();
    for (const row of ordersDaily) {
      const day = row.day;
      const cur = m.get(day) || { day, orders: 0, revenue: 0 };
      cur.orders += Number(row.orders || 0);
      cur.revenue += Number(row.revenue || 0);
      m.set(day, cur);
    }
    return Array.from(m.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [ordersDaily]);

  const weeklySeries = useMemo(() => {
    const m = new Map();
    for (const d of dailySeries) {
      const wk = startOfWeekISO(d.day);
      const cur = m.get(wk) || { week_start: wk, orders: 0, revenue: 0 };
      cur.orders += Number(d.orders || 0);
      cur.revenue += Number(d.revenue || 0);
      m.set(wk, cur);
    }
    return Array.from(m.values()).sort((a, b) =>
      a.week_start.localeCompare(b.week_start)
    );
  }, [dailySeries]);

  const coolerRowsAll = useMemo(() => {
    const knownIds = new Set(COOLERS.map((c) => c.cooler_id));
    const allIds = Array.from(
      new Set([...Object.keys(ordersByCooler), ...Object.keys(intakeByCooler)])
    );

    const ordered = [
      ...COOLERS.map((c) => c.cooler_id),
      ...allIds.filter((id) => !knownIds.has(id)),
    ];

    return ordered.map((id) => ({
      cooler_id: id,
      name: coolerLabel(id),
      address: coolerAddress(id),
      orders: Number(ordersByCooler[id]?.orders || 0),
      revenue: Number(ordersByCooler[id]?.revenue || 0),
      intakes: Number(intakeByCooler[id]?.intakes || 0),
    }));
  }, [ordersByCooler, intakeByCooler]);

  const coolerRows = useMemo(() => {
    if (showZeros) return coolerRowsAll;
    return coolerRowsAll.filter(
      (r) => (r.orders || 0) > 0 || (r.revenue || 0) > 0 || (r.intakes || 0) > 0
    );
  }, [coolerRowsAll, showZeros]);

  const exportDailyCSV = () => {
    const rows = [
      ["day", "cooler_id", "cooler_name", "orders", "revenue"],
      ...ordersDaily.map((r) => [
        r.day,
        r.cooler_id,
        coolerLabel(r.cooler_id),
        Number(r.orders || 0),
        Number(r.revenue || 0),
      ]),
    ];
    const suffix = startDate ? `${startDate}_to_today` : "all_time";
    downloadCSV(`harc_orders_daily_${suffix}.csv`, rows);
  };

  const exportWeeklyCSV = () => {
    const rows = [
      ["week_start", "orders", "revenue"],
      ...weeklySeries.map((r) => [
        r.week_start,
        Number(r.orders || 0),
        Number(r.revenue || 0),
      ]),
    ];
    const suffix = startDate ? `${startDate}_to_today` : "all_time";
    downloadCSV(`harc_orders_weekly_${suffix}.csv`, rows);
  };

  const exportCoolerCSV = () => {
    const rows = [
      ["cooler_id", "cooler_name", "orders", "revenue", "intakes"],
      ...coolerRows.map((r) => [
        r.cooler_id,
        r.name,
        Number(r.orders || 0),
        Number(r.revenue || 0),
        Number(r.intakes || 0),
      ]),
    ];
    const suffix = startDate ? `${startDate}_to_today` : "all_time";
    downloadCSV(`harc_cooler_rollup_${suffix}.csv`, rows);
  };

  if (!unlocked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: ORANGE.bg,
          color: ORANGE.text,
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            background: ORANGE.card,
            border: `1px solid ${ORANGE.border}`,
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: ORANGE.accent,
              }}
            />
            <h2 style={{ margin: 0 }}>Manager Access</h2>
          </div>

          <p style={{ marginTop: 10, marginBottom: 14, opacity: 0.9 }}>
            Enter your manager PIN to view analytics and operational tables.
          </p>

          <form onSubmit={handleUnlock} style={{ display: "flex", gap: 10 }}>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Manager PIN"
              inputMode="numeric"
              autoComplete="one-time-code"
              style={{
                flex: 1,
                padding: "12px 12px",
                borderRadius: 12,
                border: `1px solid ${ORANGE.border}`,
                outline: "none",
                fontSize: 16,
              }}
            />
            <button
              type="submit"
              disabled={unlocking}
              style={{
                ...buttonBase,
                background: ORANGE.accent,
                color: "white",
                borderColor: ORANGE.accent,
                minWidth: 120,
              }}
            >
              {unlocking ? "Checking…" : "Unlock"}
            </button>
          </form>

          {unlockError ? (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.08)",
                color: "#991B1B",
                fontWeight: 700,
              }}
            >
              {unlockError}
            </div>
          ) : null}

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
            Tip: If you refresh, you may stay unlocked on this device (local
            storage).
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ORANGE.bg,
        color: ORANGE.text,
        padding: 18,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: ORANGE.accent,
              }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                HaRC Manager Dashboard
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                cooler_id is canonical • grouped by cooler_id
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleLock}
              style={{
                ...buttonBase,
                background: ORANGE.card,
              }}
            >
              Lock
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...pillBase,
                background: tab === t ? ORANGE.accent : ORANGE.card,
                color: tab === t ? "white" : ORANGE.text,
                borderColor: tab === t ? ORANGE.accent : ORANGE.border,
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Analytics */}
        {tab === "analytics" ? (
          <div style={{ marginTop: 14 }}>
            {/* Range + exports */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DATE_RANGES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRangeId(r.id)}
                    style={{
                      ...pillBase,
                      background:
                        rangeId === r.id ? ORANGE.accent : ORANGE.card,
                      color: rangeId === r.id ? "white" : ORANGE.text,
                      borderColor:
                        rangeId === r.id ? ORANGE.accent : ORANGE.border,
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={loadAnalytics}
                  disabled={loading}
                  style={{
                    ...buttonBase,
                    background: ORANGE.card,
                  }}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
                <button onClick={exportDailyCSV} style={{ ...buttonBase }}>
                  Export Daily CSV
                </button>
                <button onClick={exportWeeklyCSV} style={{ ...buttonBase }}>
                  Export Weekly CSV
                </button>
                <button onClick={exportCoolerCSV} style={{ ...buttonBase }}>
                  Export Cooler CSV
                </button>
              </div>
            </div>

            {loadError ? (
              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(239,68,68,0.35)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#991B1B",
                  fontWeight: 800,
                }}
              >
                {loadError}
                <div style={{ fontWeight: 600, fontSize: 12, marginTop: 6 }}>
                  If this mentions a missing view, confirm you created:
                  v_orders_daily_counts (and optionally v_intake_daily_counts).
                </div>
              </div>
            ) : null}

            {/* Totals cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <Card title="Total Orders" value={fmtInt(totals.orders)} />
              <Card title="Total Revenue" value={fmtMoney(totals.revenue)} />
              <Card
                title="Total Intake Requests"
                value={fmtInt(totals.intakes)}
              />
            </div>

            {/* Toggle: show zeros */}
            <div style={{ marginTop: 10 }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: `1px solid ${ORANGE.border}`,
                  background: ORANGE.card,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={showZeros}
                  onChange={(e) => setShowZeros(e.target.checked)}
                />
                Show zero-activity coolers
                <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 700 }}>
                  (default: hidden)
                </span>
              </label>
            </div>

            {/* Cooler breakdown */}
            <div
              style={{
                marginTop: 12,
                background: ORANGE.card,
                border: `1px solid ${ORANGE.border}`,
                borderRadius: 18,
                padding: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  By Cooler {showZeros ? "(includes zeros)" : "(zeros excluded)"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Range: {startDate ? `${startDate} → today` : "All time"}
                </div>
              </div>

              <div style={{ overflowX: "auto", marginTop: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <Th>Cooler</Th>
                      <Th>cooler_id</Th>
                      <Th>Orders</Th>
                      <Th>Revenue</Th>
                      <Th>Intake</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {coolerRows.length ? (
                      coolerRows.map((r) => (
                        <tr key={r.cooler_id}>
                          <Td>
                            <div style={{ fontWeight: 900 }}>{r.name}</div>
                            {r.address ? (
                              <div style={{ fontSize: 12, opacity: 0.7 }}>
                                {r.address}
                              </div>
                            ) : null}
                          </Td>
                          <Td mono>{r.cooler_id}</Td>
                          <Td>{fmtInt(r.orders)}</Td>
                          <Td>{fmtMoney(r.revenue)}</Td>
                          <Td>{fmtInt(r.intakes)}</Td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <Td colSpan={5} style={{ opacity: 0.7 }}>
                          {loading
                            ? "Loading…"
                            : "No active coolers found for this range."}
                        </Td>
                      </tr>
                    )}

                    {/* Totals row */}
                    <tr>
                      <Td
                        style={{
                          fontWeight: 900,
                          borderTop: `2px solid ${ORANGE.border}`,
                        }}
                      >
                        TOTAL
                      </Td>
                      <Td
                        mono
                        style={{ borderTop: `2px solid ${ORANGE.border}` }}
                      >
                        —
                      </Td>
                      <Td
                        style={{
                          fontWeight: 900,
                          borderTop: `2px solid ${ORANGE.border}`,
                        }}
                      >
                        {fmtInt(totals.orders)}
                      </Td>
                      <Td
                        style={{
                          fontWeight: 900,
                          borderTop: `2px solid ${ORANGE.border}`,
                        }}
                      >
                        {fmtMoney(totals.revenue)}
                      </Td>
                      <Td
                        style={{
                          fontWeight: 900,
                          borderTop: `2px solid ${ORANGE.border}`,
                        }}
                      >
                        {fmtInt(totals.intakes)}
                      </Td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily + Weekly */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
                marginTop: 12,
              }}
            >
              <SimpleTableCard
                title="Daily Totals"
                subtitle="Rolled up from v_orders_daily_counts"
                headers={["day", "orders", "revenue"]}
                rows={dailySeries
                  .slice(-60)
                  .map((r) => [r.day, fmtInt(r.orders), fmtMoney(r.revenue)])}
                emptyText={
                  loading ? "Loading…" : "No daily rows found for this range."
                }
              />
              <SimpleTableCard
                title="Weekly Totals"
                subtitle="Computed in the app (Monday week start)"
                headers={["week_start", "orders", "revenue"]}
                rows={weeklySeries
                  .slice(-26)
                  .map((r) => [
                    r.week_start,
                    fmtInt(r.orders),
                    fmtMoney(r.revenue),
                  ])}
                emptyText={
                  loading ? "Loading…" : "No weekly rows found for this range."
                }
              />
            </div>
          </div>
        ) : null}

        {/* Orders tab */}
        {tab === "orders" ? (
          <OpTable
            title="Recent Orders"
            subtitle="Direct from public.orders"
            columns={[
              { key: "created_at", label: "Created" },
              { key: "cooler_id", label: "Cooler" },
              { key: "total", label: "Total" },
              { key: "status", label: "Status" },
            ]}
            rows={recentOrders.map((r) => ({
              ...r,
              created_at: new Date(r.created_at).toLocaleString(),
              cooler_id: `${coolerLabel(r.cooler_id)} (${r.cooler_id})`,
              total: fmtMoney(r.total),
              status: r.status ?? "—",
            }))}
            emptyText="No orders found."
          />
        ) : null}

        {/* Help tab */}
        {tab === "help" ? (
          <OpTable
            title="Help Requests"
            subtitle="If you created public.help_requests, they’ll appear here"
            columns={[
              { key: "created_at", label: "Created" },
              { key: "cooler_id", label: "Cooler" },
              { key: "need", label: "Need" },
              { key: "phone", label: "Phone" },
              { key: "status", label: "Status" },
            ]}
            rows={recentHelp.map((r) => ({
              ...r,
              created_at: new Date(r.created_at).toLocaleString(),
              cooler_id: `${coolerLabel(r.cooler_id)} (${r.cooler_id})`,
              need: r.need ?? "—",
              phone: r.phone ?? "—",
              status: r.status ?? "—",
            }))}
            emptyText="No help requests found (or table not created yet)."
          />
        ) : null}

        {/* Restock tab */}
        {tab === "restock" ? (
          <OpTable
            title="Restock Requests"
            subtitle="If you created public.restock_requests, they’ll appear here"
            columns={[
              { key: "created_at", label: "Created" },
              { key: "cooler_id", label: "Cooler" },
              { key: "items_needed", label: "Items" },
              { key: "status", label: "Status" },
            ]}
            rows={recentRestock.map((r) => ({
              ...r,
              created_at: new Date(r.created_at).toLocaleString(),
              cooler_id: `${coolerLabel(r.cooler_id)} (${r.cooler_id})`,
              items_needed:
                typeof r.items_needed === "string"
                  ? r.items_needed
                  : JSON.stringify(r.items_needed ?? ""),
              status: r.status ?? "—",
            }))}
            emptyText="No restock requests found (or table not created yet)."
          />
        ) : null}
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function Card({ title, value }) {
  return (
    <div
      style={{
        background: ORANGE.card,
        border: `1px solid ${ORANGE.border}`,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
        {title}
      </div>
      <div style={{ fontSize: 22, fontWeight: 950, marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        fontSize: 12,
        opacity: 0.75,
        padding: "10px 8px",
        borderBottom: `1px solid ${ORANGE.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, mono, style, colSpan }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: "10px 8px",
        borderBottom: `1px solid ${ORANGE.border}`,
        verticalAlign: "top",
        fontFamily: mono
          ? "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace"
          : undefined,
        fontSize: mono ? 12 : 14,
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function SimpleTableCard({ title, subtitle, headers, rows, emptyText }) {
  return (
    <div
      style={{
        background: ORANGE.card,
        border: `1px solid ${ORANGE.border}`,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontWeight: 950 }}>{title}</div>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        {subtitle}
      </div>

      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {headers.map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r, idx) => (
                <tr key={idx}>
                  {r.map((cell, i) => (
                    <Td key={i} mono={i === 0}>
                      {cell}
                    </Td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={headers.length} style={{ opacity: 0.7 }}>
                  {emptyText}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpTable({ title, subtitle, columns, rows, emptyText }) {
  return (
    <div
      style={{
        marginTop: 14,
        background: ORANGE.card,
        border: `1px solid ${ORANGE.border}`,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontWeight: 950 }}>{title}</div>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
        {subtitle}
      </div>

      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <Th key={c.key}>{c.label}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <Td key={c.key}>{r[c.key] ?? "—"}</Td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={columns.length} style={{ opacity: 0.7 }}>
                  {emptyText}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
