// src/pages/DeliveryConfirmation.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return `$${value ?? "--"}`;
  return `$${num.toFixed(2)}`;
}

export default function DeliveryConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    orderId,
    customerName,
    address1,
    city,
    zip,
    total,
    items = [],
  } = location.state || {};

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="pt-6 pb-16">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-500">
            HaRC Delivery Pilot
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Delivery request received
          </h1>
        </div>
        <button
          onClick={handleBackHome}
          className="text-xs border border-slate-300 px-3 py-1 rounded-full text-slate-700 bg-white hover:bg-slate-50"
        >
          Back to start
        </button>
      </header>

      <section className="mb-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-sm text-slate-800 mb-1">
            Thank you{customerName ? `, ${customerName}` : ""}.
          </p>
          <p className="text-xs text-slate-600">
            Your delivery request has been logged. A HaRC or Authority Health
            team member may reach out to confirm details, timing, and
            eligibility based on our current delivery zone and program rules.
          </p>

          {orderId && (
            <p className="text-[11px] text-slate-500 mt-2">
              Request ID:{" "}
              <span className="font-mono text-slate-800">
                {orderId}
              </span>
            </p>
          )}
        </div>
      </section>

      <section className="mb-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-2">Delivery address</p>
          <p className="text-sm text-slate-900">
            {address1 || "Address on file"}
          </p>
          <p className="text-sm text-slate-900">
            {city || "Detroit"}, {zip || "48xxx"}
          </p>
        </div>
      </section>

      <section className="mb-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-2">Requested items</p>
          {items.length ? (
            <>
              {items.map((item, idx) => (
                <div
                  key={item.id ?? idx}
                  className="flex items-center justify-between text-xs mb-1"
                >
                  <span className="text-slate-800">
                    {item.name || "Item"}{" "}
                    {item.qty ? (
                      <span className="text-slate-500">
                        (x{item.qty})
                      </span>
                    ) : null}
                  </span>
                  {item.price && (
                    <span className="text-slate-500">
                      {formatMoney(item.price)}
                    </span>
                  )}
                </div>
              ))}
              {typeof total === "number" && (
                <div className="mt-3 border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Estimated total</span>
                  <span className="font-semibold text-orange-500">
                    {formatMoney(total)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500">
              Item details are not available, but your request was received.
            </p>
          )}
        </div>
      </section>

      <p className="text-[10px] text-slate-500">
        This delivery option is part of a limited HaRC pilot and may not be
        available at all times or in all areas. Data from these requests helps
        Authority Health and partners understand where home delivery of healthy
        options could have the most impact.
      </p>
    </div>
  );
}
