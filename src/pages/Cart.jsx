// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../lib/ordersApi";
import { ORANGE } from "../data.js";

function money(n) {
  const x = Number(n || 0);
  return `$${x.toFixed(2)}`;
}

export default function Cart({
  selectedCooler,
  cart,
  setCart,
  cartTotal,
  setLastOrder,
}) {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");

  const hasItems = useMemo(() => {
    return Array.isArray(cart) && cart.some((i) => Number(i?.qty || 0) > 0);
  }, [cart]);

  async function onPlaceOrder() {
    setError("");

    if (!selectedCooler?.cooler_id) {
      setError("Please select a cooler first.");
      return;
    }

    if (!hasItems) {
      setError("Your cart is empty.");
      return;
    }

    const items = cart
      .filter((i) => Number(i?.qty || 0) > 0)
      .map((i) => ({
        sku: i.sku ?? i.id ?? i.name,
        name: i.name,
        price: Number(i.price || 0),
        qty: Number(i.qty || 0),
      }));

    setIsPlacing(true);

    const payload = {
      cooler_id: selectedCooler.cooler_id,
      total: Number(cartTotal || 0),
      items,
      note: note?.trim() || null,
      source: "harc-app",
    };

    const res = await createOrder(payload);

    if (!res?.ok) {
      setError(res?.error || "Order failed.");
      setIsPlacing(false);
      return;
    }

    setLastOrder(res.data);
    setCart([]);
    setNote("");
    setIsPlacing(false);

    navigate("/confirm");
  }

  return (
    <div style={{ padding: 14, color: ORANGE.text }}>
      <h2 style={{ marginTop: 0 }}>Cart</h2>

      <div
        style={{
          background: ORANGE.card,
          border: `1px solid ${ORANGE.border}`,
          borderRadius: 16,
          padding: 12,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.75 }}>Cooler</div>
        <div style={{ fontWeight: 800 }}>
          {selectedCooler?.name || "No cooler selected"}
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Total</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{money(cartTotal)}</div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Optional note</div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type a short note…"
            style={{
              width: "100%",
              marginTop: 6,
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${ORANGE.border}`,
              background: "#fff",
            }}
          />
        </div>

        {error && (
          <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>
            Error: {error}
          </div>
        )}

        <button
          onClick={onPlaceOrder}
          disabled={isPlacing}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            background: isPlacing ? "#9CA3AF" : "#16A34A",
            color: "white",
            fontWeight: 900,
          }}
        >
          {isPlacing ? "Placing Order…" : "Place Order (v2)"}
        </button>

        <button
          onClick={() => navigate("/menu")}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            background: "#F97316",
            color: "white",
            fontWeight: 900,
          }}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
