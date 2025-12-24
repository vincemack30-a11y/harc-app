// src/pages/OrderConfirm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getOrder } from "../lib/ordersApi";

// If you have ORANGE in another path, adjust this import to match your project.
// Based on your project history, ORANGE is typically exported from src/data.js or src/data/data.js.
import { ORANGE } from "../data"; // <-- If this errors, change to: "../data.js" or "../data/data.js"

function money(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function OrderConfirm() {
  const { id } = useParams(); // route param: /order-confirm/:id
  const location = useLocation();

  // We accept order passed via navigate state OR fetched by id
  const orderFromState = location?.state?.order || null;

  const [order, setOrder] = useState(orderFromState);
  const [loading, setLoading] = useState(Boolean(!orderFromState && id));
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      if (orderFromState) return;
      if (!id) return;

      setLoading(true);
      setError("");

      const res = await getOrder(id);
      if (!alive) return;

      if (!res.ok) {
        setError(res.error || "Could not load order.");
        setLoading(false);
        return;
      }

      // Some APIs return {ok:true,data:{...}} while others return {ok:true,data:[...]}
      const maybe = res.data?.data ? res.data.data : res.data;
      setOrder(maybe);
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, orderFromState]);

  const items = useMemo(() => {
    const arr = order?.items || [];
    return Array.isArray(arr) ? arr : [];
  }, [order]);

  const totals = useMemo(() => {
    const t = order?.totals || {};
    const subtotal =
      t.subtotal != null
        ? Number(t.subtotal)
        : items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);
    const tax = t.tax != null ? Number(t.tax) : 0;
    const total = t.total != null ? Number(t.total) : subtotal + tax;

    return { subtotal, tax, total };
  }, [order, items]);

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: ORANGE?.text || "#111827" }}>
          Order Confirmed
        </div>
        <div style={{ marginTop: 4, color: "#6B7280" }}>
          Thank you — your order was submitted successfully.
        </div>
      </div>
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 999,
          background: ORANGE?.bg || "#FFF7ED",
          border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
          fontWeight: 700,
          color: ORANGE?.accent || "#F97316",
          whiteSpace: "nowrap",
        }}
      >
        {order?.order_id ? `#${order.order_id}` : id ? `#${id}` : "#—"}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
        {header}
        <div style={{ marginTop: 12, padding: 14, border: "1px solid #E5E7EB", borderRadius: 12 }}>
          Loading order details…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
        {header}
        <div
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 12,
            border: "1px solid #FCA5A5",
            background: "#FEF2F2",
            color: "#991B1B",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/" style={{ color: ORANGE?.accent || "#F97316", fontWeight: 700 }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
        {header}
        <div style={{ marginTop: 12, padding: 14, border: "1px solid #E5E7EB", borderRadius: 12 }}>
          No order details available.
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/" style={{ color: ORANGE?.accent || "#F97316", fontWeight: 700 }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      {header}

      <div
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 14,
          border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
          background: "#fff",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 700 }}>Pickup location</div>
            <div style={{ marginTop: 4, fontWeight: 800 }}>
              {order?.cooler_name || order?.cooler?.name || order?.cooler_id || "—"}
            </div>
            {order?.cooler_address ? (
              <div style={{ marginTop: 4, color: "#6B7280" }}>{order.cooler_address}</div>
            ) : null}
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 700 }}>Submitted</div>
            <div style={{ marginTop: 4, fontWeight: 800 }}>
              {order?.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString()}
            </div>
            <div style={{ marginTop: 4, color: "#6B7280" }}>Manager PIN: 1357</div>
          </div>
        </div>

        <div style={{ marginTop: 14, borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10 }}>Items</div>

          {items.length === 0 ? (
            <div style={{ color: "#6B7280" }}>No item details available.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {items.map((it, idx) => (
                <div
                  key={`${it.id || it.name || "item"}_${idx}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 10px",
                    border: "1px solid #F3F4F6",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{it.name || "Item"}</div>
                  <div style={{ color: "#6B7280", fontWeight: 700 }}>x{Number(it.qty || 0)}</div>
                  <div style={{ fontWeight: 900 }}>{money(Number(it.price || 0) * Number(it.qty || 0))}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            <Row label="Subtotal" value={money(totals.subtotal)} />
            <Row label="Tax" value={money(totals.tax)} />
            <div style={{ height: 1, background: "#F3F4F6", margin: "6px 0" }} />
            <Row label="Total" value={money(totals.total)} strong />
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to="/coolers"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 12,
              border: `1px solid ${ORANGE?.border || "#FED7AA"}`,
              fontWeight: 900,
              color: ORANGE?.accent || "#F97316",
              background: ORANGE?.bg || "#FFF7ED",
            }}
          >
            Order Again
          </Link>

          <Link
            to="/"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              fontWeight: 900,
              color: "#111827",
              background: "#fff",
            }}
          >
            Back to Home
          </Link>

          {/* If you want the MPH external survey link right after checkout, keep this */}
          <a
            href="https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              fontWeight: 900,
              color: "#111827",
              background: "#fff",
            }}
          >
            Take Survey
          </a>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <div style={{ color: "#6B7280", fontWeight: strong ? 900 : 700 }}>{label}</div>
      <div style={{ fontWeight: strong ? 900 : 800 }}>{value}</div>
    </div>
  );
}
