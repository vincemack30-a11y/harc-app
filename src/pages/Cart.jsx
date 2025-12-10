// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return `$${value ?? "--"}`;
  return `$${num.toFixed(2)}`;
}

export default function Cart() {
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from Menu.jsx via navigate("/cart", { state: { cart, subtotal, totalItems } })
  const initialCart = location.state?.cart || [];
  const [cart] = useState(initialCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Compute totals from cart to be safe, even if state.subtotal is missing or stale
  const { subtotal, totalItems } = useMemo(() => {
    const subtotalCalc = cart.reduce((sum, item) => {
      const unitPrice =
        typeof item.price === "string"
          ? parseFloat(item.price)
          : item.price || 0;
      const qty = item.qty || 1;
      return sum + unitPrice * qty;
    }, 0);

    const totalItemsCalc = cart.reduce(
      (sum, item) => sum + (item.qty || 1),
      0
    );

    return {
      subtotal: subtotalCalc,
      totalItems: totalItemsCalc,
    };
  }, [cart]);

  const hasItems = cart.length > 0;

  const handleBackToMenu = () => {
    // If there is history, go back; otherwise send to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleSubmitOrder = async () => {
    if (!hasItems || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // We may have cooler info in location.state in the future; for now it's optional
      const coolerId =
        location.state?.coolerId || location.state?.cooler_id || null;

      const orderPayload = {
        cooler_id: coolerId,
        items: JSON.stringify(cart),
        total: subtotal,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select();

      if (error) {
        console.error("Order insert error:", error);
        setErrorMsg("We couldn't send your order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const inserted = data?.[0] || null;

      // Build an order object for the confirmation screen
      const orderForConfirm = {
        id: inserted?.id,
        cooler_id: coolerId,
        items: cart,
        total: subtotal,
        created_at: inserted?.created_at,
      };

      // Go to confirmation, pass order so the UI can show details
      navigate("/confirmation", {
        state: {
          order: orderForConfirm,
        },
        replace: true,
      });
    } catch (err) {
      console.error("Order submit exception:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
            HaRC Healthy Coolers
          </p>
          <h1 className="text-xl font-semibold mt-1">Your cart</h1>
        </div>

        <button
          onClick={handleBackToMenu}
          className="text-xs border border-slate-700 px-3 py-1 rounded-full"
        >
          Back
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pt-4 pb-28">
        {!hasItems ? (
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-300 mb-2">
              Your cart is empty right now.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Go back and tap on snacks or drinks to add them to your order.
            </p>
            <button
              onClick={handleBackToMenu}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-orange-500 text-black text-xs font-semibold"
            >
              Browse menu
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.map((item) => {
                const unitPrice =
                  typeof item.price === "string"
                    ? parseFloat(item.price)
                    : item.price || 0;
                const qty = item.qty || 1;
                const lineTotal = unitPrice * qty;

                return (
                  <div
                    key={item.id ?? item.name}
                    className="flex items-start justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-50">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.description || "Healthy option from the cooler."}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {qty} × {formatMoney(unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-orange-400 ml-3">
                      {formatMoney(lineTotal)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Items</span>
                <span className="text-xs text-slate-100 font-medium">
                  {totalItems} item{totalItems === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Estimated total</span>
                <span className="text-sm font-semibold text-orange-400">
                  {formatMoney(subtotal)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-400 mb-3">{errorMsg}</p>
            )}

            <p className="text-[11px] text-slate-500 mb-3">
              When you tap &quot;Send order to cooler&quot;, we log what you
              picked so we can keep good stuff stocked. You still grab your
              items directly from the cooler.
            </p>
          </>
        )}
      </main>

      {/* Sticky footer actions */}
      {hasItems && (
        <footer className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !hasItems}
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold flex items-center justify-between ${
              isSubmitting
                ? "bg-slate-700 text-slate-300"
                : "bg-orange-500 text-black"
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-[11px] uppercase tracking-[0.18em]">
                {isSubmitting ? "Sending order…" : "Send order to cooler"}
              </span>
              <span className="text-xs">
                {totalItems} item{totalItems === 1 ? "" : "s"} •{" "}
                {formatMoney(subtotal)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs block">
                {isSubmitting ? "Please wait" : "Tap to confirm"}
              </span>
            </div>
          </button>
        </footer>
      )}
    </div>
  );
}
