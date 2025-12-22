// src/pages/DeliveryCart.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

const DeliveryCart = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const deliveryInfo = location.state?.deliveryInfo;
  const cart = location.state?.cart || [];
  const subtotal = location.state?.subtotal || 0;
  const totalItems = location.state?.totalItems || 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!deliveryInfo || !cart.length) {
      navigate("/delivery", { replace: true });
    }
  }, [deliveryInfo, cart, navigate]);

  const formatMoney = (value) =>
    `$${(Number(value || 0)).toFixed(2)}`;

  const handleSubmitDeliveryOrder = async () => {
    if (!deliveryInfo || !cart.length) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const itemsPayload = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
      }));

      const { data, error } = await supabase
        .from("delivery_orders")
        .insert([
          {
            customer_name: deliveryInfo.customer_name,
            phone: deliveryInfo.phone,
            address_line1: deliveryInfo.address_line1,
            address_line2: deliveryInfo.address_line2,
            city: deliveryInfo.city,
            zip: deliveryInfo.zip,
            items: itemsPayload,
            total: subtotal,
            notes: deliveryInfo.notes || "",
            status: "new",
          },
        ])
        .select();

      if (error) {
        console.error("Delivery insert error:", error);
        setErrorMsg("Something went wrong sending your request. Try again.");
      } else {
        const newOrder = data?.[0];
        navigate("/delivery/confirmed", {
          state: { orderId: newOrder?.id || null },
          replace: true,
        });
      }
    } catch (err) {
      console.error("Delivery request error:", err);
      setErrorMsg("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
            HaRC Delivery Pilot
          </p>
          <h1 className="text-xl font-semibold mt-1">
            Review delivery request
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs border border-slate-700 px-3 py-1 rounded-full"
        >
          Back
        </button>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Address summary */}
        {deliveryInfo && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
            <h2 className="font-semibold mb-1">Delivery details</h2>
            <p>{deliveryInfo.customer_name}</p>
            <p className="text-slate-300">{deliveryInfo.phone}</p>
            <p className="mt-1">
              {deliveryInfo.address_line1}
              {deliveryInfo.address_line2
                ? `, ${deliveryInfo.address_line2}`
                : ""}
            </p>
            <p>
              {deliveryInfo.city} {deliveryInfo.zip}
            </p>
            {deliveryInfo.notes && (
              <p className="mt-1 text-slate-300">
                <span className="font-semibold">Notes:</span>{" "}
                {deliveryInfo.notes}
              </p>
            )}
          </section>
        )}

        {/* Cart items */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
          <h2 className="font-semibold mb-2">
            Items ({totalItems || 0})
          </h2>

          {!cart.length ? (
            <p className="text-slate-400 text-xs">
              No items selected. Go back to the menu to add snacks.
            </p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {cart.map((item) => {
                const price =
                  typeof item.price === "string"
                    ? parseFloat(item.price)
                    : item.price || 0;
                const lineTotal = price * (item.qty || 1);

                return (
                  <li key={item.id ?? item.name} className="py-2 flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.qty || 1} × {formatMoney(price)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatMoney(lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-3 flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Estimated total (before any delivery fee)
            </p>
            <p className="text-sm font-bold">{formatMoney(subtotal)}</p>
          </div>
        </section>

        {errorMsg && (
          <p className="text-[11px] text-red-400">{errorMsg}</p>
        )}
      </main>

      {/* Sticky footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
        <button
          disabled={!cart.length || isSubmitting}
          onClick={handleSubmitDeliveryOrder}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold ${
            !cart.length || isSubmitting
              ? "bg-slate-800 text-slate-500"
              : "bg-orange-500 text-black"
          }`}
        >
          {isSubmitting ? "Sending request…" : "Send delivery request"}
        </button>
        <p className="mt-2 text-[10px] text-slate-500 text-center">
          You’ll get a follow-up call or text from the HaRC team to confirm
          delivery time, eligibility, and any fees.
        </p>
      </footer>
    </div>
  );
};

export default DeliveryCart;
