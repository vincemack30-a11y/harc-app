// src/pages/Confirmation.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from Cart (may be empty if user hits URL directly)
  const {
    orderId,
    coolerId,
    coolerName,
    items = [],
    subtotal,
    totalItems,
  } = location.state || {};

  const hasOrder = !!orderId || items.length > 0;

  const handleSurvey = () => {
    navigate("/survey", {
      state: {
        coolerId: coolerId || null,
        coolerName: coolerName || null,
      },
    });
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
            HaRC Healthy Coolers
          </p>
          <h1 className="text-xl font-semibold mt-1">
            Order confirmed
          </h1>
        </div>

        <button
          onClick={handleBackHome}
          className="text-xs border border-slate-700 px-3 py-1 rounded-full"
        >
          Back to start
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pt-6 pb-28">
        {/* Thank-you block */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Thank you for choosing healthier options.
          </h2>
          <p className="text-sm text-slate-300 mb-2">
            Your order has been sent to the HaRC cooler so we can keep
            it stocked with what people actually grab.
          </p>
          <p className="text-xs text-slate-400">
            This pilot is a partnership between{" "}
            <span className="font-medium">Authority Health</span>,{" "}
            <span className="font-medium">HaRC</span>, and community
            locations across Detroit.
          </p>
        </section>

        {/* Order summary */}
        {hasOrder ? (
          <section className="mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 mb-1">
                Order summary
              </p>

              {orderId && (
                <p className="text-xs text-slate-400 mb-2">
                  Receipt ID:{" "}
                  <span className="font-mono text-slate-200">
                    {orderId}
                  </span>
                </p>
              )}

              {coolerId && (
                <p className="text-sm mb-1">
                  <span className="text-slate-400">Cooler:</span>{" "}
                  <span className="font-medium">
                    {coolerName || coolerId}
                  </span>
                </p>
              )}

              <div className="mt-3 border-t border-slate-800 pt-3 space-y-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id ?? idx}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-slate-200">
                      {item.name || "Item"}
                      {item.qty ? ` (x${item.qty})` : null}
                    </span>
                    {item.price && (
                      <span className="text-slate-400">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Order details not available, but your request was
                    received.
                  </p>
                )}
              </div>

              <div className="mt-3 flex justify-between items-center text-sm">
                <span className="text-slate-300">
                  {typeof totalItems === "number"
                    ? `${totalItems} item${
                        totalItems === 1 ? "" : "s"
                      }`
                    : ""}
                </span>
                {typeof subtotal === "number" && (
                  <span className="font-semibold text-orange-400">
                    Total: ${subtotal.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300">
              We couldn&apos;t find your order details, but your
              cooler request has been recorded. You can always start a
              new order from the home screen.
            </div>
          </section>
        )}

        {/* Survey CTA */}
        <section>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
            Quick check-in
          </p>
          <p className="text-sm text-slate-200 mb-4">
            Can you answer{" "}
            <span className="font-semibold">three quick questions</span>{" "}
            about how you feel and how fast the experience was? Your
            feedback helps bring more healthy options to neighborhoods
            like yours.
          </p>

          <button
            onClick={handleSurvey}
            className="w-full rounded-full bg-orange-500 text-black font-semibold text-sm px-4 py-3"
          >
            Take the 30-second survey
          </button>

          <button
            onClick={handleBackHome}
            className="w-full mt-3 rounded-full border border-slate-700 text-slate-200 text-xs px-4 py-2"
          >
            Skip for now – return to home
          </button>
        </section>
      </main>
    </div>
  );
}
