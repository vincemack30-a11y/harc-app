import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { COOLERS, ORANGE } from "../data.js";

// Formats like: 2025-12-15
const toISODate = (d) => {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Currency without Intl complexity (keeps it deterministic)
const money = (n) => {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
};

const trendMark = (n) => {
  const v = Number(n || 0);
  if (v > 0) return "↑";
  if (v < 0) return "↓";
  return "—";
};

export default function WeeklyRollup() {
  const [anchorDate, setAnchorDate] = useState(() => toISODate(new Date()));
  const [rows, setRows] = useState([]); // raw RPC rows (may omit zero coolers)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Fetch rollup via RPC
  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase.rpc("weekly_rollup", {
        anchor_date: anchorDate,
      });

      if (!alive) return;

      if (error) {
        setErr(error.message || "Weekly rollup RPC failed.");
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    };

    run();

    return () => {
      alive = false;
    };
  }, [anchorDate]);

  // Normalize against COOLERS so zero-activity coolers ALWAYS appear
  const normalized = useMemo(() => {
    const byId = new Map();
    for (const r of rows) {
      byId.set(String(r.cooler_id), r);
    }

    return COOLERS.map((c) => {
      const r = byId.get(String(c.cooler_id));
      return {
        cooler_id: c.cooler_id,
        name: c.name,
        address: c.address,

        this_orders: Number(r?.this_orders_count || 0),
        this_revenue: Number(r?.this_revenue || 0),
        this_intake: Number(r?.this_intake_count || 0),

        last_orders: Number(r?.last_orders_count || 0),
        last_revenue: Number(r?.last_revenue || 0),
        last_intake: Number(r?.last_intake_count || 0),

        d_orders: Number(r?.delta_orders || 0),
        d_revenue: Number(r?.delta_revenue || 0),
        d_intake: Number(r?.delta_intake || 0),

        this_week_start: r?.this_week_start || null,
        this_week_end: r?.this_week_end || null,
        last_week_start: r?.last_week_start || null,
        last_week_end: r?.last_week_end || null,
      };
    });
  }, [rows]);

  const totals = useMemo(() => {
    return normalized.reduce(
      (acc, r) => {
        acc.this_orders += r.this_orders;
        acc.this_revenue += r.this_revenue;
        acc.this_intake += r.this_intake;

        acc.last_orders += r.last_orders;
        acc.last_revenue += r.last_revenue;
        acc.last_intake += r.last_intake;

        return acc;
      },
      {
        this_orders: 0,
        this_revenue: 0,
        this_intake: 0,
        last_orders: 0,
        last_revenue: 0,
        last_intake: 0,
      }
    );
  }, [normalized]);

  const deltas = useMemo(() => {
    return {
      orders: totals.this_orders - totals.last_orders,
      revenue: totals.this_revenue - totals.last_revenue,
      intake: totals.this_intake - totals.last_intake,
    };
  }, [totals]);

  const rangeLabel = useMemo(() => {
    // Prefer using RPC bounds if present (first row), otherwise show anchorDate only
    const any = rows?.[0];
    if (any?.this_week_start && any?.this_week_end && any?.last_week_start && any?.last_week_end) {
      const thisEndMinus1 = any.this_week_end; // end is exclusive; we keep it as-is for clarity
      const lastEndMinus1 = any.last_week_end;
      return `This week: ${any.this_week_start} → ${thisEndMinus1} (exclusive) | Last week: ${any.last_week_start} → ${lastEndMinus1} (exclusive)`;
    }
    return `Anchor date: ${anchorDate} (ISO week starts Monday)`;
  }, [rows, anchorDate]);

  return (
    <div
      style={{
        background: ORANGE.card,
        border: `1px solid ${ORANGE.border}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, color: ORANGE.text, fontSize: 16 }}>Weekly Rollup (Monday-start)</div>
          <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>{rangeLabel}</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Anchor date
            <input
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              style={{
                display: "block",
                marginTop: 4,
                padding: "8px 10px",
                borderRadius: 10,
                border: `1px solid ${ORANGE.border}`,
                outline: "none",
              }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <KpiCard title="This Week Orders" value={String(totals.this_orders)} delta={deltas.orders} />
        <KpiCard title="This Week Revenue" value={money(totals.this_revenue)} delta={deltas.revenue} isMoney />
        <KpiCard title="This Week Help/Intake" value={String(totals.this_intake)} delta={deltas.intake} />
      </div>

      <div style={{ marginTop: 14 }}>
        {loading && <div style={{ color: "#6B7280", fontSize: 13 }}>Loading weekly rollup…</div>}
        {!!err && (
          <div style={{ marginTop: 8, color: "#B91C1C", fontSize: 13, fontWeight: 700 }}>
            {err}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <Th>Cooler</Th>
              <Th>This Week Orders</Th>
              <Th>Last Week Orders</Th>
              <Th>Δ Orders</Th>
              <Th>This Week Revenue</Th>
              <Th>Last Week Revenue</Th>
              <Th>Δ Revenue</Th>
              <Th>This Week Intake</Th>
              <Th>Last Week Intake</Th>
              <Th>Δ Intake</Th>
            </tr>
          </thead>
          <tbody>
            {normalized.map((r) => (
              <tr key={r.cooler_id}>
                <Td>
                  <div style={{ fontWeight: 800, color: ORANGE.text }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{r.address}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    <span style={{ fontWeight: 700 }}>cooler_id:</span> {r.cooler_id}
                  </div>
                </Td>

                <Td align="right">{r.this_orders}</Td>
                <Td align="right">{r.last_orders}</Td>
                <DeltaTd n={r.d_orders} />

                <Td align="right">{money(r.this_revenue)}</Td>
                <Td align="right">{money(r.last_revenue)}</Td>
                <DeltaTd n={r.d_revenue} isMoney />

                <Td align="right">{r.this_intake}</Td>
                <Td align="right">{r.last_intake}</Td>
                <DeltaTd n={r.d_intake} />
              </tr>
            ))}

            {/* Totals row */}
            <tr>
              <Td style={{ fontWeight: 900 }}>TOTAL</Td>

              <Td align="right" style={{ fontWeight: 900 }}>{totals.this_orders}</Td>
              <Td align="right" style={{ fontWeight: 900 }}>{totals.last_orders}</Td>
              <DeltaTd n={deltas.orders} strong />

              <Td align="right" style={{ fontWeight: 900 }}>{money(totals.this_revenue)}</Td>
              <Td align="right" style={{ fontWeight: 900 }}>{money(totals.last_revenue)}</Td>
              <DeltaTd n={deltas.revenue} isMoney strong />

              <Td align="right" style={{ fontWeight: 900 }}>{totals.this_intake}</Td>
              <Td align="right" style={{ fontWeight: 900 }}>{totals.last_intake}</Td>
              <DeltaTd n={deltas.intake} strong />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ title, value, delta, isMoney }) {
  const v = Number(delta || 0);
  const mark = trendMark(v);

  return (
    <div
      style={{
        background: ORANGE.bg,
        border: `1px solid ${ORANGE.border}`,
        borderRadius: 14,
        padding: 12,
      }}
    >
      <div style={{ color: "#374151", fontSize: 12, fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: ORANGE.text }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>
        WoW: <span style={{ fontWeight: 900, color: ORANGE.text }}>{mark}</span>{" "}
        <span style={{ fontWeight: 800 }}>
          {isMoney ? money(v) : v}
        </span>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        position: "sticky",
        top: 0,
        textAlign: "left",
        background: ORANGE.card,
        borderBottom: `1px solid ${ORANGE.border}`,
        padding: "10px 10px",
        fontSize: 12,
        color: "#374151",
        fontWeight: 900,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align, style }) {
  return (
    <td
      style={{
        borderBottom: `1px solid ${ORANGE.border}`,
        padding: "10px 10px",
        fontSize: 13,
        color: ORANGE.text,
        verticalAlign: "top",
        textAlign: align || "left",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function DeltaTd({ n, isMoney = false, strong = false }) {
  const v = Number(n || 0);
  const mark = trendMark(v);

  // We keep color neutral (no green/red assumption), but still show direction.
  return (
    <Td align="right" style={{ fontWeight: strong ? 900 : 800 }}>
      {mark} {isMoney ? money(v) : v}
    </Td>
  );
}
