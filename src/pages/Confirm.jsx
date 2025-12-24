// src/pages/Confirm.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { COOLERS, MENU, ORANGE } from "../data.js";
import { useApp } from "../AppContext.jsx";
import { useCart } from "../CartContext.jsx";
import { createOrder } from "../lib/ordersApi.js";

function money(n) {
  return Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default function Confirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { activeCoolerId, setActiveCoolerId } = useApp();
  const { cart, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const resolvedCoolerId = searchParams.get("cooler_id") || activeCoolerId || "";

  const activeCooler = useMemo(() => {
    return COOLERS.find((c) => c.cooler_id === resolvedCoolerId) || null;
  }, [resolvedCoolerId]);

  // Join cart [{id, qty}] with MENU details
  const items = useMemo(() => {
    if (!Array.isArray(cart)) return [];
    return cart
      .map((c) => {
        const m = MENU.find((x) => x.id === c.id);
        if (!m) return null;
        const qty = Number(c.qty || 0);
        const price = Number(m.price || 0);
        return {
          id: m.id,
          name: m.name,
          price,
          qty,
          lineTotal: price * qty,
        };
      })
      .filter(Boolean);
  }, [cart]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + Number(i.lineTotal || 0), 0);
    const tax = 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  // Hard guard — redirect only if truly missing
  if (!resolvedCoolerId) {
    navigate("/coolers", { replace: true });
    return null;
  }

  async function placeOrder() {
    if (isSubmitting) return;
    setErrorMsg("");

    if (!items.length) {
      setErrorMsg("Your cart is empty. Add items before confirming.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        channel: "customer",
        status: "placed",
        cooler_id: resolvedCoolerId,
        cooler_name: activeCooler?.name || "",
        cooler_address: activeCooler?.address || "",
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          line_total: i.lineTotal,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        created_at: new Date().toISOString(),
      };

      const res = await createOrder(payload);

      if (res && res.ok === false) {
        throw new Error(res.error || "Order failed");
      }

      const order = res?.data || res?.order || res || payload;
      const orderId =
        order?.id || order?.order_id || order?.uuid || order?.orderId || null;

      // Persist cooler selection + clear cart after success
      setActiveCoolerId(resolvedCoolerId);
      if (typeof clearCart === "function") clearCart();

      // Navigate to confirmation
      if (orderId) {
        navigate(`/order-confirm/${encodeURIComponent(orderId)}`, {
          state: { order },
        });
      } else {
        navigate(`/order-confirm`, { state: { order } });
      }
    } catch (err) {
      setErrorMsg(err?.message || "Could not place order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: ORANGE.text }}>
            Confirm Order
          </h1>
          <div style={{ marginTop: 4, color: ORANGE.subtext }}>
            Cooler: <strong>{activeCooler?.name || "Selected cooler"}</strong>
          </div>
        </div>

        <Link
          to={`/cart?cooler_id=${encodeURIComponent(resolvedCoolerId)}`}
          style={{
            alignSelf: "center",
            padding: "10px 12px",
            borderRadius: 12,
            border: `2px solid ${ORANGE.border}`,
            background: "#fff",
            color: ORANGE.accent,
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Back to Cart
        </Link>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 14,
          border: `1px solid ${ORANGE.border}`,
          background: "#fff",
        }}
      >
        {errorMsg ? (
          <div
            style={{
              marginBottom: 10,
              padding: 10,
              borderRadius: 12,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              color: "#991B1B",
              fontWeight: 800,
            }}
          >
            {errorMsg}
          </div>
        ) : null}

        {items.length === 0 ? (
          <div style={{ color: ORANGE.subtext, fontWeight: 700 }}>
            Your cart is empty.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #F3F4F6",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{it.name}</div>
                  <div style={{ marginTop: 4, color: ORANGE.subtext, fontWeight: 700 }}>
                    {money(it.price)} each · Qty {it.qty}
                  </div>
                </div>
                <div style={{ fontWeight: 900 }}>{money(it.lineTotal)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14, borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label="Tax" value={money(totals.tax)} />
          <div style={{ height: 1, background: "#F3F4F6", margin: "8px 0" }} />
          <Row label="Total" value={money(totals.total)} strong />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={placeOrder}
            disabled={isSubmitting || items.length === 0}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: `2px solid ${ORANGE.accent}`,
              background: isSubmitting || items.length === 0 ? "#F3F4F6" : ORANGE.accent,
              color: isSubmitting || items.length === 0 ? "#9CA3AF" : "#fff",
              fontWeight: 900,
              cursor: isSubmitting || items.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>

          <Link
            to={`/menu?cooler_id=${encodeURIComponent(resolvedCoolerId)}`}
            style={{
              alignSelf: "center",
              padding: "10px 14px",
              borderRadius: 12,
              border: `1px solid ${ORANGE.border}`,
              background: ORANGE.bg,
              color: ORANGE.accent,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <div style={{ color: ORANGE.subtext, fontWeight: strong ? 900 : 700 }}>
        {label}
      </div>
      <div style={{ fontWeight: strong ? 900 : 800 }}>{value}</div>
    </div>
  );
}
