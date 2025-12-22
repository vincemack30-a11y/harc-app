// src/pages/DeliveryCheckout.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return `$${value ?? "--"}`;
  return `$${num.toFixed(2)}`;
}

export default function DeliveryCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialCart = location.state?.cart || [];
  const [cart] = useState(initialCart);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("Detroit");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const canSubmit =
    hasItems &&
    customerName.trim() &&
    phone.trim() &&
    address1.trim() &&
    city.trim() &&
    zip.trim() &&
    !isSubmitting;

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        customer_name: customerName.trim(),
        phone: phone.trim(),
        address_line1: address1.trim(),
        address_line2: address2.trim() || null,
        city: city.trim(),
        zip: zip.trim(),
        items: JSON.stringify(cart),
        total: subtotal,
        notes: notes.trim() || null,
        status: "new",
      };

      const { data, error } = await supabase
        .from("delivery_orders")
        .insert([payload])
        .select();

      if (error) {
        console.error("Delivery order insert error:", error);
        setErrorMsg("We couldn't place this delivery order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const inserted = data?.[0] || null;

      navigate("/delivery/confirmation", {
        replace: true,
        state: {
          orderId: inserted?.id || null,
          customerName: payload.customer_name,
          address1: payload.address_line1,
          city: payload.city,
          zip: payload.zip,
          total: subtotal,
          items: cart,
        },
      });
    } catch (err) {
      console.error("Delivery submit exception:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 pb-24">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-500">
            HaRC Delivery Pilot
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Delivery details
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            If you&apos;re inside the delivery area, our team will reach out
            using this information.
          </p>
        </div>
        <button
          onClick={handleBack}
          className="text-xs border border-slate-300 px-3 py-1 rounded-full text-slate-700 bg-white hover:bg-slate-50"
        >
          Back
        </button>
      </header>

      {/* Order summary */}
      <section className="mb-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-2">Order summary</p>
          {cart.map((item, idx) => {
            const unitPrice =
              typeof item.price === "string"
                ? parseFloat(item.price)
                : item.price || 0;
            const qty = item.qty || 1;
            const lineTotal = unitPrice * qty;

            return (
              <div
                key={item.id ?? idx}
                className="flex items-start justify-between text-xs mb-1"
              >
                <div className="pr-2">
                  <p className="text-slate-900">
                    {item.name || "Item"}{" "}
                    {qty > 1 ? (
                      <span className="text-slate-500">(x{qty})</span>
                    ) : null}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.description || "Healthy option for delivery."}
                  </p>
                </div>
                <p className="text-slate-700 font-medium">
                  {formatMoney(lineTotal)}
                </p>
              </div>
            );
          })}

          {!hasItems && (
            <p className="text-xs text-slate-500">
              Your cart is empty. Go back and add items to request delivery.
            </p>
          )}

          {hasItems && (
            <div className="mt-3 border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
              <span className="font-semibold text-orange-500">
                {formatMoney(subtotal)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Delivery form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Name
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/70"
            placeholder="First and last name"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Phone number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/70"
            placeholder="Best number to reach you"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Address line 1
          </label>
          <input
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/70"
            placeholder="Street address"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Address line 2{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/70"
            placeholder="Apartment, unit, building, etc."
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              City
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/70"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              ZIP
            </label>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/70"
              placeholder="482xx"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Notes for delivery{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/70"
            placeholder="Gate code, buzzer, special instructions…"
          />
        </div>

        {errorMsg && (
          <p className="text-[11px] text-red-500">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold mt-1 ${
            canSubmit
              ? "bg-orange-500 text-black"
              : "bg-slate-300 text-slate-500"
          }`}
        >
          {isSubmitting ? "Placing delivery request…" : "Place delivery request"}
        </button>
      </form>

      <p className="text-[10px] text-slate-500 mt-3 px-1">
        Delivery availability may be limited by time, distance, and program
        rules. A HaRC or Authority Health team member may call or text to
        confirm details.
      </p>
    </div>
  );
}
