// src/pages/DeliveryStart.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DeliveryStart = () => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleContinue = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName || !phone || !address1 || !city || !zip) {
      setErrorMsg("Please fill in name, phone, address, city, and ZIP.");
      return;
    }

    const deliveryInfo = {
      customer_name: customerName,
      phone,
      address_line1: address1,
      address_line2: address2,
      city,
      zip,
      notes,
    };

    navigate("/delivery/menu", {
      state: { deliveryInfo },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
          HaRC Delivery Pilot
        </p>
        <h1 className="text-xl font-semibold mt-1">
          Request a delivery from HaRC
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Share your contact + address, then pick your snacks. A team member
          will follow up to confirm timing and payment.
        </p>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-4">
        <form className="space-y-3" onSubmit={handleContinue}>
          <div>
            <label className="block text-xs mb-1 text-slate-300">
              Your name
            </label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-300">
              Mobile phone
            </label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(313) ..."
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-300">
              Address line 1
            </label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-300">
              Address line 2 (optional)
            </label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Apt, unit, floor"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs mb-1 text-slate-300">
                City
              </label>
              <input
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Detroit"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs mb-1 text-slate-300">
                ZIP
              </label>
              <input
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="482xx"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-300">
              Notes for delivery (optional)
            </label>
            <textarea
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gate code, preferred time window, special instructions…"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-400 mt-1">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="mt-3 w-full rounded-full bg-orange-500 text-black text-sm font-semibold py-3"
          >
            Continue to delivery menu
          </button>
        </form>
      </main>
    </div>
  );
};

export default DeliveryStart;
