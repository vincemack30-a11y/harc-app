// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// When running locally (vite dev), call the live Vercel API.
// In production (on Vercel), keep it relative (/api/...).
const API_BASE = import.meta.env.DEV
  ? "https://harc-r4yekhdui-vincemack30-7988s-projects.vercel.app"
  : "";

function CartPage({ cart, setCart, selectedCooler, onOrderComplete }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const handleSubmit = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const now = new Date().toISOString();

      // Send BOTH camelCase and snake_case so whatever the API expects will work
      const payload = {
        items: cart,
        total,
        coolerId: selectedCooler ? selectedCooler.id : null,
        cooler_id: selectedCooler ? selectedCooler.id : null,
        createdAt: now,
        created_at: now,
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // if body isn't JSON, keep data = null
      }

      if (!res.ok) {
        console.error("Order submit error:", data || res.statusText);
        setErrorMsg(
          "There was a problem sending your order. Please try again."
        );
        setSubmitting(false);
        return;
      }

      // Save last order for confirmation screen
      const orderData = data && data.order ? data.order : payload;
      onOrderComplete(orderData);

      // Clear cart
      setCart([]);

      // Go to confirmation page
      navigate("/order-confirmation");
    } catch (err) {
      console.error("Order submit network error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your cart</h2>

      {selectedCooler ? (
        <p className="text-xs mb-2">
          Cooler: <strong>{selectedCooler.name}</strong>
        </p>
      ) : (
        <p className="text-xs mb-2">
          No cooler selected. You can still place an order, but staff may ask
          which location you’re at.
        </p>
      )}

      {cart.length === 0 ? (
        <p className="mt-3 text-sm">Your cart is empty.</p>
      ) : (
        <>
          <ul className="mb-3 text-sm">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between mb-1">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="font-semibold mb-3 text-sm">
            Total: ${total.toFixed(2)}
          </p>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
          >
            {submitting ? "Sending order..." : "Submit order & show to staff"}
          </button>

          {errorMsg && (
            <p className="text-xs text-red-800 mt-2">{errorMsg}</p>
          )}
        </>
      )}
    </div>
  );
}

export default CartPage;
