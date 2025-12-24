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

  const [note, setNote] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
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

    if (!selectedCoolerId || !hasItems) {
      setErrorMsg("Missing cooler or cart items.");
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
        setErrorMsg(res?.error || "Order failed. Please try again.");
        setIsPlacing(false);
        return;
      }

      // success
      setLastOrder?.(res.data || payload);
      clearCart?.();
      setNote("");
      setIsPlacing(false);
      navigate("/order-confirm");
    } catch (e) {
      setErrorMsg(e?.message || "Order failed. Please try again.");
      setIsPlacing(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Cart</h2>
        <div style={{ color: "#6B7280" }}>
          Cooler: <strong>{selectedCooler?.name || "None selected"}</strong>
        </div>
      </div>

      {!hasItems ? (
        <div style={{ padding: 16, border: "1px solid #FED7AA", borderRadius: 12, background: "#FFFFFF" }}>
          Your cart is empty.{" "}
          <Link to="/menu" style={{ color: "#F97316", fontWeight: 700 }}>
            Go to Menu
          </Link>
        </div>
      ) : (
        <div style={{ border: "1px solid #FED7AA", borderRadius: 14, background: "#FFFFFF", padding: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>
            {cart.map((i) => (
              <div
                key={i.sku ?? i.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  padding: 12,
                  border: "1px solid #FED7AA",
                  borderRadius: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{i.name}</div>
                  <div style={{ color: "#6B7280" }}>${Number(i.price || 0).toFixed(2)} each</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => decFromCart(i.sku ?? i.id)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: "1px solid #FED7AA",
                      background: "#FFF7ED",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>

                  <div style={{ minWidth: 28, textAlign: "center", fontWeight: 800 }}>{i.qty}</div>

                  <button
                    onClick={() => addToCart(i.sku ?? i.id)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: "1px solid #FED7AA",
                      background: "#FFF7ED",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900 }}>Total</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>${Number(cartTotal || 0).toFixed(2)}</div>
              </div>

              <button
                onClick={placeOrder}
                disabled={isPlacing}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "0",
                  background: isPlacing ? "#9CA3AF" : "#16A34A",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: isPlacing ? "not-allowed" : "pointer",
                  minWidth: 160,
                }}
              >
                {isPlacing ? "Placing..." : "Place Order"}
              </button>
            </div>

            <div>
              <div style={{ color: "#6B7280", fontWeight: 700, marginBottom: 6 }}>
                Optional note (allergies, substitutions, etc.)
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type a short note..."
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #FED7AA",
                  outline: "none",
                }}
              />
            </div>

            {errorMsg ? (
              <div style={{ color: "#DC2626", fontWeight: 800 }}>Error: {errorMsg}</div>
            ) : null}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                to="/menu"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#F97316",
                  color: "#fff",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Back to Menu
              </Link>

              <Link
                to="/help"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #FED7AA",
                  background: "#FFF7ED",
                  color: "#111827",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
