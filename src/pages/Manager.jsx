import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { COOLERS, ORANGE } from "./data.js";
import {
  Shield,
  CalendarDays,
  RefreshCw,
  Lock,
  Unlock,
  ShoppingCart,
  ClipboardList,
  Truck,
} from "lucide-react";

/**
 * Manager Analytics (HaRC)
 * - PIN unlock via Supabase RPC: public.manager_unlock(pin text) returns boolean
 * - Analytics split by cooler (canonical cooler_id)
 * - Includes coolers with zero activity (normalized off COOLERS)
 * - Date range filters (7/30/all/custom)
 *
 * NOTE:
 * If your table names differ, adjust TABLES below.
 */
const TABLES = {
  orders: "orders",
  help: "intake_requests", // "help requests" table
  restock: "restock_logs", // optional; if you don’t have it, this page still works
};

const TABS = [
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "help", label: "Help", icon: ClipboardList },
  { id: "restock", label: "Restock", icon: Truck },
];

const DATE_PRESETS = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "all", label: "All time" },
  { id: "custom", label: "Custom" },
];

function isoDate(d) {
  // YYYY-MM-DD (local)
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfDayISO(d) {
  // ISO string without timezone issues for Postgres comparisons
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function endOfDayISO(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function safeNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function byCoolerBase() {
  // Normalize so we always show every cooler (even with zero activity)
  const map = {};
  for (const c of COOLERS) {
    map[c.cooler_id] = {
      cooler_id: c.cooler_id,
      name: c.name,
      address: c.address,
      orders_count: 0,
      orders_items: 0,
      orders_revenue: 0,
      help_count: 0,
      restock_count: 0,
    };
  }
  return map;
}

export default function Manager() {
  const [tab, setTab] = useState("orders");

  // Unlock state
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  // Date range state
  const [preset, setPreset] = useState("7");
  const [customStart, setCustomStart] = useState(isoDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
  const [customEnd, setCustomEnd] = useState(isoDate(new Date()));

  // Data
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [orders, setOrders] = useState([]);
  const [help, setHelp] = useState([]);
  const [restock, setRestock] = useState([]);

  const range = useMemo(() => {
    if (preset === "all") return { mode: "all", startISO: null, endISO: null };
    if (preset === "custom") {
      const s = new Date(customStart);
      const e = new Date(customEnd);
      return { mode: "bounded", startISO: startOfDayISO(s), endISO: endOfDayISO(e) };
    }
    const days = preset === "30" ? 30 : 7;
    const end = new Date();
    const start = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
    return { mode: "bounded", startISO: startOfDayISO(start), endISO: endOfDayISO(end) };
  }, [preset, customStart, customEnd]);

  const rollups = useMemo(() => {
    const base = byCoolerBase();

    // Orders rollup
    for (const o of orders) {
      const cid = o.cooler_id;
      if (!cid || !base[cid]) continue;

      base[cid].orders_count += 1;

      // item_count: try common fields; fallback to 1 if unknown
      const itemCount =
        safeNum(o.item_count) ||
        safeNum(o.items_count) ||
        (Array.isArray(o.items) ? o.items.length : 0) ||
        1;

      base[cid].orders_items += itemCount;

      // revenue: try total/amount fields
      const amt =
        safeNum(o.total) ||
        safeNum(o.total_amount) ||
        safeNum(o.amount) ||
        safeNum(o.price_total) ||
        0;

      base[cid].orders_revenue += amt;
    }

    // Help rollup
    for (const h of help) {
      const cid = h.cooler_id;
      if (!cid || !base[cid]) continue;
      base[cid].help_count += 1;
    }

    // Restock rollup
    for (const r of restock) {
      const cid = r.cooler_id;
      if (!cid || !base[cid]) continue;
      base[cid].restock_count += 1;
    }

    const rows = Object.values(base);

    const totals = rows.reduce(
      (acc, x) => {
        acc.orders_count += x.orders_count;
        acc.orders_items += x.orders_items;
        acc.orders_revenue += x.orders_revenue;
        acc.help_count += x.help_count;
        acc.restock_count += x.restock_count;
        return acc;
      },
      { orders_count: 0, orders_items: 0, orders_revenue: 0, help_count: 0, restock_count: 0 }
    );

    return { rows, totals };
  }, [orders, help, restock]);

  async function handleUnlock(e) {
    e?.preventDefault?.();
    setUnlockError("");
    setUnlocking(true);

    try {
      const cleanPin = String(pin || "").trim();
      if (!cleanPin) {
        setUnlockError("Enter your manager PIN.");
        setUnlocking(false);
        return;
      }

      // RPC must be: public.manager_unlock(pin text) returns boolean
      const { data, error } = await supabase.rpc("manager_unlock", { pin: cleanPin });

      if (error) throw error;

      if (data === true) {
        setUnlocked(true);
      } else {
        setUnlocked(false);
        setUnlockError("Incorrect PIN.");
      }
    } catch (e2) {
      setUnlocked(false);
      setUnlockError(e2?.message || "Unlock failed.");
    } finally {
      setUnlocking(false);
    }
  }

  async function loadData() {
    setErr("");
    setLoading(true);

    try {
      // Orders
      let qOrders = supabase
        .from(TABLES.orders)
        .select("*")
        .order("created_at", { ascending: false });

      if (range.mode === "bounded") {
        qOrders = qOrders.gte("created_at", range.startISO).lte("created_at", range.endISO);
      }

      const { data: oData, error: oErr } = await qOrders;
      if (oErr) throw oErr;

      // Help
      let qHelp = supabase
        .from(TABLES.help)
        .select("*")
        .order("created_at", { ascending: false });

      if (range.mode === "bounded") {
        qHelp = qHelp.gte("created_at", range.startISO).lte("created_at", range.endISO);
      }

      const { data: hData, error: hErr } = await qHelp;
      if (hErr) throw hErr;

      // Restock (optional)
      let rData = [];
      try {
        let qRestock = supabase
          .from(TABLES.restock)
          .select("*")
          .order("created_at", { ascending: false });

        if (range.mode === "bounded") {
          qRestock = qRestock.gte("created_at", range.startISO).lte("created_at", range.endISO);
        }

        const { data, error } = await qRestock;
        if (error) {
          // If table doesn't exist, ignore and keep empty.
          rData = [];
        } else {
          rData = data || [];
        }
      } catch {
        rData = [];
      }

      setOrders(oData || []);
      setHelp(hData || []);
      setRestock(rData || []);
    } catch (e) {
      setErr(e?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!unlocked) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, range.startISO, range.endISO, range.mode]);

  const bgStyle = {
    background: ORANGE?.bg || "#FFF7ED",
    minHeight: "100vh",
  };

  const Card = ({ children }) => (
    <div
      style={{
        background: ORANGE?.card || "#FFFFFF",
        border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );

  const Chip = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      style={{
        borderRadius: 999,
        padding: "8px 12px",
        border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
        background: active ? (ORANGE?.accent || "#F97316") : "#fff",
        color: active ? "#fff" : (ORANGE?.text || "#1F2937"),
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );

  if (!unlocked) {
    return (
      <div style={bgStyle}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: ORANGE?.accent || "#F97316",
                color: "#fff",
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: ORANGE?.text || "#1F2937" }}>
                Manager Access
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>Enter PIN to view analytics</div>
            </div>
          </div>

          <Card>
            <form onSubmit={handleUnlock} style={{ display: "grid", gap: 12 }}>
              <label style={{ fontWeight: 800, color: ORANGE?.text || "#1F2937" }}>Manager PIN</label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g., 1357"
                inputMode="numeric"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
                  outline: "none",
                  fontSize: 16,
                }}
              />

              {unlockError ? (
                <div style={{ color: "#B91C1C", fontWeight: 700 }}>{unlockError}</div>
              ) : null}

              <button
                type="submit"
                disabled={unlocking}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "none",
                  background: ORANGE?.accent || "#F97316",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: unlocking ? "not-allowed" : "pointer",
                }}
              >
                {unlocking ? <Lock size={18} /> : <Unlock size={18} />}
                {unlocking ? "Unlocking…" : "Unlock"}
              </button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  const tableRows =
    tab === "orders" ? orders : tab === "help" ? help : restock;

  return (
    <div style={bgStyle}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px 44px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 1000, color: ORANGE?.text || "#1F2937" }}>
              Manager Analytics
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Split by cooler • Totals included • Zero-activity coolers shown
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 14,
              border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
              background: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 900,
            }}
          >
            <RefreshCw size={18} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Date range */}
        <div style={{ marginTop: 14 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
                <CalendarDays size={18} />
                Date Range
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DATE_PRESETS.map((p) => (
                  <Chip key={p.id} active={preset === p.id} onClick={() => setPreset(p.id)}>
                    {p.label}
                  </Chip>
                ))}
              </div>

              {preset === "custom" ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.8 }}>Start</div>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.8 }}>End</div>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {err ? (
              <div style={{ marginTop: 10, color: "#B91C1C", fontWeight: 800 }}>{err}</div>
            ) : null}
          </Card>
        </div>

        {/* Totals cards */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          <Card>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>Total Orders</div>
            <div style={{ fontSize: 26, fontWeight: 1000 }}>{rollups.totals.orders_count}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>Items Sold</div>
            <div style={{ fontSize: 26, fontWeight: 1000 }}>{rollups.totals.orders_items}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>Revenue</div>
            <div style={{ fontSize: 26, fontWeight: 1000 }}>{money(rollups.totals.orders_revenue)}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>Help Requests</div>
            <div style={{ fontSize: 26, fontWeight: 1000 }}>{rollups.totals.help_count}</div>
          </Card>
        </div>

        {/* Split by cooler */}
        <div style={{ marginTop: 14 }}>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 1000, marginBottom: 10 }}>By Cooler</div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.8 }}>
                    <th style={{ padding: "10px 8px" }}>Cooler</th>
                    <th style={{ padding: "10px 8px" }}>cooler_id</th>
                    <th style={{ padding: "10px 8px" }}>Orders</th>
                    <th style={{ padding: "10px 8px" }}>Items</th>
                    <th style={{ padding: "10px 8px" }}>Revenue</th>
                    <th style={{ padding: "10px 8px" }}>Help</th>
                    <th style={{ padding: "10px 8px" }}>Restock</th>
                  </tr>
                </thead>
                <tbody>
                  {rollups.rows.map((r) => (
                    <tr key={r.cooler_id} style={{ borderTop: `1px solid ${ORANGE?.border || "#FED7AA"}` }}>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: 1000 }}>{r.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>{r.address}</div>
                      </td>
                      <td style={{ padding: "10px 8px", fontWeight: 900 }}>{r.cooler_id}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 900 }}>{r.orders_count}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 900 }}>{r.orders_items}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 900 }}>{money(r.orders_revenue)}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 900 }}>{r.help_count}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 900 }}>{r.restock_count}</td>
                    </tr>
                  ))}

                  {/* Totals row */}
                  <tr style={{ borderTop: `2px solid ${ORANGE?.accent || "#F97316"}` }}>
                    <td style={{ padding: "12px 8px", fontWeight: 1000 }}>TOTAL</td>
                    <td style={{ padding: "12px 8px", fontWeight: 900, opacity: 0.75 }}>—</td>
                    <td style={{ padding: "12px 8px", fontWeight: 1000 }}>{rollups.totals.orders_count}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 1000 }}>{rollups.totals.orders_items}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 1000 }}>{money(rollups.totals.orders_revenue)}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 1000 }}>{rollups.totals.help_count}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 1000 }}>{rollups.totals.restock_count}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Tabs + table */}
        <div style={{ marginTop: 14 }}>
          <Card>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
                      background: active ? (ORANGE?.accent || "#F97316") : "#fff",
                      color: active ? "#fff" : (ORANGE?.text || "#1F2937"),
                      cursor: "pointer",
                      fontWeight: 1000,
                    }}
                  >
                    <Icon size={18} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.8 }}>
                    <th style={{ padding: "10px 8px" }}>created_at</th>
                    <th style={{ padding: "10px 8px" }}>cooler_id</th>
                    <th style={{ padding: "10px 8px" }}>summary</th>
                    <th style={{ padding: "10px 8px" }}>status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => {
                    const created = row.created_at ? new Date(row.created_at).toLocaleString() : "";
                    const cid = row.cooler_id || "";
                    const status = row.status || row.state || "";
                    const summary =
                      tab === "orders"
                        ? `Order • ${money(row.total || row.total_amount || row.amount)} • items: ${
                            row.item_count || row.items_count || (Array.isArray(row.items) ? row.items.length : "")
                          }`
                        : tab === "help"
                        ? `Help • ${row.request_type || row.type || "request"}`
                        : `Restock • ${row.note || row.action || "entry"}`;

                    return (
                      <tr key={row.id || `${row.created_at}-${Math.random()}`} style={{ borderTop: `1px solid ${ORANGE?.border || "#FED7AA"}` }}>
                        <td style={{ padding: "10px 8px", fontWeight: 900 }}>{created}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 900 }}>{cid}</td>
                        <td style={{ padding: "10px 8px" }}>{summary}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 900 }}>{status}</td>
                      </tr>
                    );
                  })}

                  {tableRows.length === 0 ? (
                    <tr style={{ borderTop: `1px solid ${ORANGE?.border || "#FED7AA"}` }}>
                      <td colSpan={4} style={{ padding: "12px 8px", opacity: 0.8, fontWeight: 800 }}>
                        No rows found for this date range.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
          Manager view is unlocked for this browser session. If you want auto-lock on refresh, tell me and I’ll add it.
        </div>
      </div>
    </div>
  );
}
