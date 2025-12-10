// src/Confirmation.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return `$${value ?? "--"}`;
  return `$${num.toFixed(2)}`;
}

export default function Confirmation() {
  const location = useLocation();
  const order = location.state?.order || null;
  const coolerId = order?.cooler_id || null;

  const hasItems =
    order &&
    (Array.isArray(order.items) ? order.items.length > 0 : !!order.items);

  return (
    <div className="pt-6">
      <div className="bg-white/90 border border-orange-200 rounded-2xl shadow-sm p-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Thank you
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Your order has been sent to the HaRC cooler
        </h1>
        <p className="text-sm text-slate-600">
          You can grab your items from the cooler now. This helps us keep track
          of what people are choosing so we can bring more of what you like.
        </p>
      </div>

      {/* Optional summary if we have order details */}
      {order && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Order summary
              </p>
              <p className="text-sm text-slate-800">
                Cooler:{" "}
                <span className="font-semibold">
                  {coolerId ? String(coolerId) : "–"}
                </span>
              </p>
            </div>
            {order.total != null && (
              <p className="text-sm font-semibold text-slate-900">
                {formatMoney(order.total)}
              </p>
            )}
          </div>

          {hasItems ? (
            <ul className="text-sm text-slate-700 space-y-1">
              {Array.isArray(order.items) ? (
                order.items.map((item, idx) => (
                  <li
                    key={item.id || item.name || idx}
                    className="flex justify-between"
                  >
                    <span>{item.name || "Item"}</span>
                    <span className="text-slate-600">
                      x{item.qty || item.quantity || 1}
                    </span>
                  </li>
                ))
              ) : (
                <li>{String(order.items)}</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              (No item details available, but your order was recorded.)
            </p>
          )}
        </div>
      )}

      {/* Next steps */}
      <div className="bg-white/90 border border-emerald-200 rounded-2xl shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Quick question before you go?
        </p>
        <p className="text-xs text-slate-600 mb-3">
          Your feedback helps Authority Health and our partners keep these
          coolers stocked with what Detroit really wants.
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/survey"
            state={{
              coolerId: coolerId,
              orderId: order?.id || null,
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow hover:bg-emerald-600"
          >
            Take 30-second survey
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
          >
            Start a new order
          </Link>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-4">
        HaRC Healthy Coolers • Authority Health • Detroit Wayne County. Data
        from this cooler is used to improve access to healthy options and
        support grant reporting. No personal health information is collected on
        this screen.
      </p>
    </div>
  );
}
