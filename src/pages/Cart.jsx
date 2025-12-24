// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../lib/ordersApi.js";

export default function Cart({ ctx }) {
  const navigate = useNavigate();

  const {
    selectedCooler,
    selectedCoolerId,
    cart,
    cartTotal,
    addToCart,
    decFromCart,
    clearCart,
    setLastOrder,
  } = ctx;

  const [isPlacing, setIsPlacing] = useState(false);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const hasItems = cart.length > 0;

  const items = useMemo(() => {
    return cart.map((i) => ({
      sku: i.sku ?? i.id,
      name: i.name,
      price: Number(i.price || 0),
      qty: Number(i.qty || 0),
      line_total: Number(i.price || 0) * Number(i.qty || 0),
    }));
  }, [cart]);

  async function placeOrder() {
    setErrorMsg("");

    if (!selectedCoolerId) {
      setErrorMsg("Missing cooler selection.");
      return;
    }
    if (!hasItems) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setIsPlacing(true);

    try {
      const payload = {
        cooler_id: selectedCoolerId,
        cooler_name: selectedCooler?.name || null,
        total: Number(cartTotal || 0),
        items,
        note: note?.trim() || null,
        source: "harc-app",
      };

      const res = await createOrder(payload);

      if (!res?.ok) {
        setErrorMsg(res?.error || "Order failed.");
        setIsPlacing(false);
        return;
      }

      // Success
      setLastOrder(res.data);
      clearCart();
      setNote("");
      setIsPlacing(false);
      navigate("/order-confirm");
    } catch (e) {
      setErrorMsg("Order failed.");
      setIsPlacing(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h2 style={{ margin: 0 }}>Cart</h2>

      <div style={{ opacity: 0.85 }}>
        Cooler: <b>{selectedCooler?.name || "None"}</b>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 12,
          background: "var(--card)",
        }}
      >
        {cart.length === 0 ? (
          <div style={{ opacity: 0.75 }}>No items yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {cart.map((item) => (
              <div
                key={item.sku ?? item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <div style={{ display: "grid" }}>
                  <b>{item.name}</b>
                  <span style={{ opacity: 0.8 }}>${Number(item.price).toFixed(2)} each</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    className="btn"
                    onClick={() => decFromCart(item.sku ?? item.id)}
                    disabled={isPlacing}
                    style={{ width: 36, height: 36, borderRadius: 12 }}
                    aria-label="Decrease"
                  >
                    -
                  </button>

                  <div style={{ minWidth: 24, textAlign: "center" }}>
                    <b>{item.qty}</b>
                  </div>

                  <button
                    className="btn"
                    onClick={() => addToCart(item)}
                    disabled={isPlacing}
                    style={{ width: 36, height: 36, borderRadius: 12 }}
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div>
            <div style={{ opacity: 0.8 }}>Total</div>
            <div style={{ fontSize: 18 }}>
              <b>${Number(cartTotal || 0).toFixed(2)}</b>
            </div>
          </div>

          <button
            className="btnPrimary"
            onClick={placeOrder}
            disabled={isPlacing || !hasItems || !selectedCoolerId}
            style={{ minWidth: 160 }}
          >
            {isPlacing ? "Placing..." : "Place Order (v2)"}
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ opacity: 0.8, marginBottom: 6 }}>Optional note</div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type a short note..."
            disabled={isPlacing}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              outline: "none",
            }}
          />
        </div>

        {errorMsg ? (
          <div style={{ marginTop: 10, color: "#dc2626", fontWeight: 600 }}>
            Error: {errorMsg}
          </div>
        ) : null}

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <Link to="/menu" className="btnPrimary" style={{ textDecoration: "none" }}>
            Back to Menu
          </Link>
          <Link to="/help" className="btn" style={{ textDecoration: "none" }}>
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}
