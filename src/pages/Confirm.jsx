// src/pages/Confirm.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Confirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderMeta = location.state?.orderMeta || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500">
            HaRC Healthy Coolers
          </p>
          <h1 className="text-xl font-semibold text-slate-900 mt-1">
            Order confirmed
          </h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-xs border border-slate-300 px-3 py-1 rounded-full text-slate-700"
        >
          New order
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 py-6">
        <section className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-700 mb-3">
            Thank you for using a HaRC Healthy Cooler. Your order has been sent
            to the cooler.
          </p>

          {orderMeta && (
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p>
                <span className="font-semibold">Cooler:</span>{" "}
                {orderMeta.cooler_id || "--"}
              </p>
              <p>
                <span className="font-semibold">Items:</span>{" "}
                {orderMeta.totalItems} item
                {orderMeta.totalItems === 1 ? "" : "s"}
              </p>
              <p>
                <span className="font-semibold">Estimated total:</span>{" "}
                ${orderMeta.subtotal?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">
            If you have any issues with your order or cooler access, a HaRC team
            member can assist you at the clinic or community site.
          </p>
        </section>
      </main>

      {/* Footer button */}
      <footer className="px-4 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full rounded-full bg-slate-900 text-white text-sm font-semibold py-3"
        >
          Back to coolers
        </button>
      </footer>
    </div>
  );
};

export default Confirm;
