// src/pages/Cart.jsx
import React, { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MENU, ORANGE } from "../data.js";
import { useCart } from "../CartContext.jsx";

function money(n) {
  return Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default function Cart() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const coolerId = searchParams.get("cooler_id") || "";

  const { cart, setQty, removeItem, clearCart } = useCart();

  // Join cart [{id, qty}] with MENU [{id, name, price}]
  const items = useMemo(() => {
    if (!Array.isArray(cart)) return [];

    return cart
      .map((c) => {
        const menuItem = MENU.find((m) => m.id === c.id);
        if (!menuItem) return null;

        return {
          ...menuItem,
          qty: c.qty,
          lineTotal: Number(menuItem.price) * Number(c.qty),
        };
      })
      .filter(Boolean);
  }, [cart]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const tax = 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  function goConfirm() {
    navigate(`/confirm${coolerId ? `?cooler_id=${coolerId}` : ""}`);
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: ORANGE.text }}>
            Your Cart
          </h1>
          <div style={{ marginTop: 4, color: ORANGE.subtext }}>
            Review items before confirming your order.
          </div>
        </div>

        <Link
          to={`/menu${coolerId ? `?cooler_id=${coolerId}` : ""}`}
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
          Back to Menu
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
                  gridTemplateColumns: "1fr auto auto",
                  gap: 10,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #F3F4F6",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{it.name}</div>
                  <div style={{ marginTop: 4, color: ORANGE.subtext }}>
                    {money(it.price)} each
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setQty(it.id, it.qty - 1)}
                    style={qtyBtn()}
                  >
                    −
                  </button>
                  <div style={{ minWidth: 28, textAlign: "center", fontWeight: 900 }}>
                    {it.qty}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQty(it.id, it.qty + 1)}
                    style={qtyBtn()}
                  >
                    +
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>{money(it.lineTotal)}</div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    style={{
                      ...qtyBtn(),
                      border: "1px solid #E5E7EB",
                      background: "#fff",
                      color: "#111827",
                    }}
                  >
                    Remove
                  </button>
                </div>
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

        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={goConfirm}
            disabled={items.length === 0}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: `2px solid ${ORANGE.accent}`,
              background: ORANGE.accent,
              color: "#fff",
              fontWeight: 900,
              cursor: items.length ? "pointer" : "not-allowed",
            }}
          >
            Continue to Confirm
          </button>

          <button
            type="button"
            onClick={clearCart}
            disabled={items.length === 0}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              background: "#fff",
              fontWeight: 900,
            }}
          >
            Clear Cart
          </button>
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

function qtyBtn() {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${ORANGE.border}`,
    background: ORANGE.bg,
    color: ORANGE.accent,
    fontWeight: 900,
    cursor: "pointer",
  };
}
