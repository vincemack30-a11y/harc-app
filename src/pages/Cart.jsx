import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

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
    return cart.map((i) => ({
      sku: i.sku,
      name: i.name,
      price: i.price,
      qty: i.qty,
      line_total: (i.price || 0) * (i.qty || 0),
    }));
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
      // ✅ FIX A: note + status are persisted (requires DB columns)
      const payload = {
        cooler_id: selectedCoolerId,
        total: Number(cartTotal.toFixed(2)),
        note: note?.trim() || null,
        status: "placed",
        items: lineItems,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([payload])
        .select();

      if (error) throw error;

      const inserted = data?.[0] || {
        id: `local_${Date.now()}`,
        ...payload,
      };

      setLastOrder({
        order_id: inserted.id,
        cooler_id: inserted.cooler_id,
        total: inserted.total,
        items: inserted.items,
      });

      clearCart();
      navigate("/confirm");
    } catch (e) {
      console.error("[HaRC] placeOrder error", e);
      setErrorMsg(
        e?.message ||
          "Order failed. Check Supabase columns, schema cache, and RLS policies."
      );
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
            <div key={i.sku} className="card" style={{ borderRadius: 14 }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{i.name}</div>
                  <div className="small">${i.price.toFixed(2)} each</div>
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
          <div className="small">${cartTotal.toFixed(2)}</div>
        </div>

        <button
          className="btn btn-green"
          disabled={!hasItems || isPlacing}
          onClick={placeOrder}
        >
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
