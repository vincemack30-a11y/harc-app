// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COOLERS, ORANGE } from "../data.js";
import { createOrder } from "../lib/ordersApi.js";

export default function Cart({
  selectedCoolerId,
  cart,
  setCart,
  setLastOrder,
}) {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");

  const selectedCooler = useMemo(() => {
    return COOLERS.find((c) => c.cooler_id === selectedCoolerId) || null;
  }, [selectedCoolerId]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
      0
    );
  }, [cart]);

  const inc = (skuOrId) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => (x.sku ?? x.id) === skuOrId);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], qty: Number(next[idx].qty || 0) + 1 };
      return next;
    });
  };

  const dec = (skuOrId) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => (x.sku ?? x.id) === skuOrId);
      if (idx < 0) return prev;
      const next = [...prev];
      const newQty = Number(next[idx].qty || 0) - 1;
      if (newQty <= 0) return next.filter((_, i) => i !== idx);
      next[idx] = { ...next[idx], qty: newQty };
      return next;
    });
  };

  async function placeOrder() {
    setError("");

    if (!selectedCoolerId) {
      setError("Please select a cooler first.");
      return;
    }
    if (!cart || cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsPlacing(true);
    try {
      const items = cart.map((i) => ({
        sku: i.sku ?? i.id,
        name: i.name,
        price: Number(i.price || 0),
        qty: Number(i.qty || 0),
      }));

      const payload = {
        cooler_id: selectedCoolerId,
        total: Number(cartTotal.toFixed(2)),
        items,
        note: note?.trim() ? note.trim() : null,
        source: "harc-app",
      };

      const res = await createOrder(payload);

      if (!res?.ok) {
        setError(res?.error || "Order failed. Please try again.");
        return;
      }

      // save + clear
      setLastOrder(res.data);
      setCart([]);
      setNote("");

      navigate("/confirm");
    } catch (e) {
      setError("Order failed. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div
      style={{
        padding: 16,
        background: ORANGE.bg,
        minHeight: "calc(100vh - 72px)",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          background: ORANGE.card,
          border: `1px solid ${ORANGE.border}`,
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ margin: 0, color: ORANGE.text }}>Cart</h2>
        <div style={{ marginTop: 6, color: "#6b7280", fontSize: 14 }}>
          Cooler:{" "}
          <b style={{ color: ORANGE.text }}>
            {selectedCooler?.name || "None selected"}
          </b>
        </div>

        <div style={{ marginTop: 16 }}>
          {cart.length === 0 ? (
            <div style={{ color: "#6b7280" }}>No items in cart.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {cart.map((item) => {
                const key = item.sku ?? item.id;
                return (
                  <div
                    key={key}
                    style={{
                      border: `1px solid ${ORANGE.border}`,
                      borderRadius: 14,
                      padding: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: ORANGE.text }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        ${Number(item.price || 0).toFixed(2)} each
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => dec(key)}
                        style={qtyBtn()}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <div style={{ width: 26, textAlign: "center", fontWeight: 800 }}>
                        {Number(item.qty || 0)}
                      </div>
                      <button
                        onClick={() => inc(key)}
                        style={qtyBtn()}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${ORANGE.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, color: ORANGE.text }}>
              Total
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: ORANGE.text }}>
              ${Number(cartTotal || 0).toFixed(2)}
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={isPlacing || cart.length === 0 || !selectedCoolerId}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "0",
              background: "#16a34a",
              color: "white",
              fontWeight: 900,
              cursor: isPlacing ? "not-allowed" : "pointer",
              opacity: isPlacing ? 0.7 : 1,
              minWidth: 170,
            }}
          >
            {isPlacing ? "Placing..." : "Place Order (v2)"}
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#6b7280" }}>
            Optional note
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type a short note..."
            style={{
              width: "100%",
              marginTop: 6,
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${ORANGE.border}`,
              outline: "none",
            }}
          />
        </div>

        {error ? (
          <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>
            Error: {error}
          </div>
        ) : null}

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/menu")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "0",
              background: "#f97316",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Back to Menu
          </button>
          <button
            onClick={() => navigate("/help")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: `1px solid ${ORANGE.border}`,
              background: "white",
              color: ORANGE.text,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Need Help?
          </button>
        </div>
      </div>
    </div>
  );
}

function qtyBtn() {
  return {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: "1px solid #fed7aa",
    background: "white",
    fontWeight: 900,
    cursor: "pointer",
  };
}
