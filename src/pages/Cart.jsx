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
        total: Number(cartTotal.toFixed(2)),
        items,
        note: note?.trim() || null,
        source: "harc-app",
      };

      const res = await createOrder(payload);

      if (!res?.ok) {
        throw new Error(res?.error || "Order failed");
      }

      setLastOrder(res.data);
      clearCart();
      navigate("/confirm");
    } catch (err) {
      console.error("[HaRC] placeOrder error", err);
      setErrorMsg(err.message || "Order failed.");
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Cart</h1>
      <p className="h2">
        Cooler: <strong>{selectedCooler?.name || "Not selected"}</strong>
      </p>

      <hr className="hr" />

      {cart.map((i) => (
        <div key={i.sku ?? i.id} className="card">
          <div style={{ fontWeight: 900 }}>{i.name}</div>
          <div className="small">${i.price.toFixed(2)} each</div>

          <div className="row">
            <button className="btn" onClick={() => decFromCart(i.sku)}>
              -
            </button>
            <span className="badge">{i.qty}</span>
            <button className="btn" onClick={() => addToCart(i)}>
              +
            </button>
          </div>
        </div>
      ))}

      <hr className="hr" />

      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>Total</strong>
          <div>${cartTotal.toFixed(2)}</div>
        </div>

        <button
          className="btn btn-green"
          disabled={!hasItems || isPlacing}
          onClick={placeOrder}
        >
          {isPlacing ? "Placing..." : "Place Order (v2)"}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="small">Optional note</div>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type a short note..."
        />
      </div>

      {errorMsg && (
        <div className="small" style={{ color: "#b91c1c", marginTop: 10 }}>
          Error: {errorMsg}
        </div>
      )}

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
