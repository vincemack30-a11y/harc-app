import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Cart = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // If user hits Cart directly with no state, bounce them back
  if (!state || !state.cart || state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center">
        <p className="text-sm mb-4">Your cart is empty.</p>
        <button
          className="px-4 py-2 bg-orange-500 text-black rounded-full text-sm"
          onClick={() => navigate("/menu")}
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const cart = state.cart;
  const subtotal = state.subtotal;
  const totalItems = state.totalItems;
  const coolerId = state.coolerId ?? null; // will be null for now unless you pass one

  const handleSubmitOrder = async () => {
    try {
      // ONLY send fields that exist in your Supabase "orders" table.
      // From the error, there is no "subtotal" column, so we DON'T send it.
      const payload = {
        items: cart,       // JSONB column in orders table
        cooler_id: coolerId, // optional if your table has this (ok if column is nullable)
        // created_at will use the default in Supabase if you have one
      };

      const { error } = await supabase.from("orders").insert([payload]);

      if (error) {
        console.error("Supabase order insert error:", error);
        alert(`Order failed to submit. ${error.message || "Please try again."}`);
        return;
      }

      // Frontend can still show subtotal + count, even if DB doesn't store them yet
      navigate("/confirmation", {
        state: {
          totalItems,
          subtotal,
        },
      });
    } catch (err) {
      console.error("Unexpected order submit error:", err);
      alert("Order failed due to an unexpected error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Cart</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-xs border border-slate-700 px-3 py-1 rounded-full"
        >
          Back
        </button>
      </header>

      {/* Items */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {cart.map((item) => {
          const unitPrice =
            typeof item.price === "string"
              ? parseFloat(item.price)
              : item.price || 0;

          return (
            <div
              key={item.id ?? item.name}
              className="border border-slate-800 rounded-2xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-slate-400">
                  {item.qty} × ${unitPrice.toFixed(2)}
                </p>
              </div>
              <p className="text-orange-400 font-semibold">
                {(unitPrice * (item.qty || 1)).toFixed(2)}
              </p>
            </div>
          );
        })}

        {/* Summary (frontend only) */}
        <div className="border border-slate-800 rounded-2xl p-4 space-y-1">
          <p className="text-sm">Items: {totalItems}</p>
          <p className="text-sm font-semibold text-orange-400">
            Total: ${subtotal.toFixed(2)}
          </p>
        </div>
      </main>

      {/* Checkout Button */}
      <footer className="px-4 pb-6">
        <button
          onClick={handleSubmitOrder}
          className="w-full bg-orange-500 text-black font-semibold py-3 rounded-full text-sm"
        >
          Submit Order
        </button>
      </footer>
    </div>
  );
};

export default Cart;
