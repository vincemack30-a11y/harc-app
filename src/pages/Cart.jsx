// src/pages/Cart.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

function Cart() {
  const { items, removeFromCart, clearCart } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const money = (value) => `$${value.toFixed(2)}`;

  // Empty cart state
  if (!items.length) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          fontSize: "13px",
          color: "#475569",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: "4px",
          }}
        >
          Your cart is empty
        </h2>
        <p style={{ fontSize: "12px" }}>
          Add items from a HaRC Healthy Cooler to see them here.
        </p>
        <div style={{ marginTop: "4px" }}>
          <Link
            to="/coolers"
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Browse coolers
          </Link>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        fontSize: "13px",
        color: "#475569",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "#0f172a",
        }}
      >
        Your cart
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 10px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ flex: 1, marginRight: "8px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {item.name || "Item"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Qty: {item.quantity || 1} · {money(item.price || 0)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {money((item.price || 0) * (item.quantity || 1))}
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.id ?? index)}
                style={{
                  border: "none",
                  background: "none",
                  color: "#ef4444",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary + actions */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <button
            type="button"
            onClick={clearCart}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              color: "#ef4444",
              cursor: "pointer",
            }}
          >
            Clear cart
          </button>

          <Link
            to="/confirm"
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: "9999px",
              background:
                "linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #15803d 100%)",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 3px 7px rgba(34,197,94,0.4)",
            }}
          >
            Checkout & confirm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
