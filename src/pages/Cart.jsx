// src/pages/Cart.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COOLERS, ORANGE } from "../data";
import { createOrder } from "../lib/ordersApi";

export default function Cart({
  selectedCoolerId,
  cart = [],            // ✅ hard default prevents crashes
  setCart,
  setLastOrder,
}) {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     Derived Data
  ================================ */

  const selectedCooler = useMemo(() => {
    return COOLERS.find((c) => c.cooler_id === selectedCoolerId) || null;
  }, [selectedCoolerId]);

  const cartTotal = useMemo(() => {
    if (!Array.isArray(cart)) return 0;

    return cart.reduce(
      (sum, item) =>
        sum + Number(item?.price || 0) * Number(item?.qty || 0),
      0
    );
  }, [cart]);

  /* ===============================
     Quantity Controls
  ================================ */

  const inc = (sku) => {
    setCart((prev = []) => {
      const idx = prev.findIndex((i) => i.sku === sku);
      if (idx === -1) return prev;

      const next = [...prev];
      next[idx] = { ...next[idx], qty: (next[idx].qty || 0) + 1 };
      return next;
    });
  };

  const dec = (sku) => {
    setCart((prev = []) => {
      const idx = prev.findIndex((i) => i.sku === sku);
      if (idx === -1) return prev;

      const next = [...prev];
      const newQty = (next[idx].qty || 0) - 1;

      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }

      next[idx] = { ...next[idx], qty: newQty };
      return next;
    });
  };

  /* ===============================
     Place Order
  ================================ */

  async function placeOrder() {
    setError("");

    if (!selectedCoolerId) {
      setError("Please select a cooler first.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacing(true);

      const res = await createOrder({
        cooler_id: selectedCoolerId,
        items: cart,
        note,
        total: cartTotal,
      });

      if (!res?.ok) {
        throw new Error(res?.error || "Order failed");
      }

      setLastOrder(res.data);
      setCart([]);
      navigate("/confirm");
    } catch (e) {
      setError(e.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  }

  /* ===============================
     Render
  ================================ */

  return (
    <div style={{ background: ORANGE.bg, minHeight: "100vh", padding: 16 }}>
      <h2>Cart</h2>

      {selectedCooler && (
        <p style={{ color: ORANGE.muted }}>
          Cooler: {selectedCooler.name}
        </p>
      )}

      {cart.map((item) => (
        <div
          key={item.sku}
          style={{
            background: ORANGE.card,
            border: `1px solid ${ORANGE.border}`,
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          <strong>{item.name}</strong>
          <div>${item.price.toFixed(2)}</div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => dec(item.sku)}>-</button>
            <span>{item.qty}</span>
            <button onClick={() => inc(item.sku)}>+</button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <strong>Total: ${cartTotal.toFixed(2)}</strong>
      </div>

      <textarea
        placeholder="Optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ width: "100%", marginTop: 12 }}
      />

      {error && (
        <div style={{ color: "red", marginTop: 10 }}>{error}</div>
      )}

      <button
        onClick={placeOrder}
        disabled={placing}
        style={{
          marginTop: 16,
          background: "#16A34A",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
        }}
      >
        {placing ? "Placing..." : "Place Order (v2)"}
      </button>
    </div>
  );
}
