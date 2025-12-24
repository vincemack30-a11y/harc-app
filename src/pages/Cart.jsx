// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../api.js";

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

  const lineItems = useMemo(() => {
    return cart.map((i) => {
      const sku = i.sku ?? i.id ?? i.name;
      const price = Number(i.price || 0);
      const qty = Number(i.qty || 0);
      return {
        sku,
        name: i.name,
        price,
        qty,
        line_total: price * qty,
      };
    });
  }, [cart]);

  async function placeOrder() {
    setErrorMsg("");

    if (!selectedCooler || !selectedCoolerId) {
      setErrorMsg("Select a cooler before placing an order.");
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
        total: Number(Number(cartTotal || 0).toFixed(2)),
        items: lineItems,
        source: "harc-app",
        note: note?.trim() || null,
      };

      const res = await createOrder(payload);

      if (!res?.ok) {
        throw new Error(res?.error || "Order failed.");
      }

      const inserted = res?.data || { id: `local_${Date.now()}`, ...payload };

      setLastOrder({
        order_id: inserted.id,
        cooler_id: inserted.cooler_id,
        total: inserted.total,
        items: inserted.items,
        note: inserted.note ?? null,
        created_at: inserted.created_at ?? null,
        source: inserted.source ?? "harc-app",
      });

      clearCart();
      navigate("/confirm");
    } catch (e) {
      console.error("[HaRC] placeOrder error", e);
      setErrorMsg(e?.message || "Order failed.");
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Cart</h1>

      <p className="h2">
        Cooler: <strong>{selectedCooler ? selectedCooler.name : "Not selected"}</strong>
      </p>

      {!selectedCooler ? (
        <div className="row">
          <Link to="/coolers" className="btn btn-primary">
            Select a Cooler
          </Link>
        </div>
      ) : null}

      <hr className="hr" />

      {cart.length === 0 ? (
        <div className="small">No items yet. Go back to the menu to add items.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {cart.map((i) => (
            <div
              key={i.sku ?? i.id ?? i.name}
              className="card"
              style={{ borderRadius: 14 }}
            >
              <div
                className="row"
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{i.name}</div>
                  <div className="small">${Number(i.price || 0).toFixed(2)} each</div>
                </div>

                <div className="row" style={{ alignItems: "center" }}>
                  <button className="btn" onClick={() => decFromCart(i.sku)}>
                    -
                  </button>
                  <span className="badge">{i.qty}</span>
                  <button className="btn" onClick={() => addToCart(i)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="hr" />

      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Total</div>
          <div className="small">${Number(cartTotal || 0).toFixed(2)}</div>
        </div>

        <button className="btn btn-green" disabled={!hasItems || isPlacing} onClick={placeOrder}>
          {isPlacing ? "Placing..." : "Place Order"}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="small" style={{ marginBottom: 6 }}>
          Optional note (allergies, substitutions, etc.)
        </div>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type a short note..."
        />
      </div>

      {errorMsg ? (
        <div style={{ marginTop: 12 }} className="small">
          <strong style={{ color: "#b91c1c" }}>Error:</strong> {errorMsg}
        </div>
      ) : null}

      <hr className="hr" />

      <div className="row">
        <Link to="/menu" className="btn btn-primary">
          Back to Menu
        </Link>
        <Link to="/help" className="btn">
          Need Help?
        </Link>
      </div>
    </div>
  );
}
