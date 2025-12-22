// src/pages/DeliveryConfirm.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DeliveryConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // This is whatever we passed from DeliveryCart when we navigated here
  const details = location.state || {};

  const {
    customer_name,
    phone,
    address_line1,
    address_line2,
    city,
    zip,
    total,
  } = details;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/90 border border-orange-200 rounded-2xl shadow-md p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-500 mb-2">
          HaRC Healthy Coolers
        </p>
        <h1 className="text-xl font-bold mb-1">Delivery request received</h1>
        <p className="text-sm text-slate-600 mb-4">
          Thank you! A HaRC team member will review your delivery request and
          follow up to confirm delivery time and eligibility.
        </p>

        <div className="border-t border-slate-200 pt-3 mt-2 space-y-2 text-sm">
          <p className="font-semibold text-slate-800">Delivery details</p>
          {customer_name && (
            <p>
              <span className="font-medium">Name:</span> {customer_name}
            </p>
          )}
          {phone && (
            <p>
              <span className="font-medium">Phone:</span> {phone}
            </p>
          )}
          {(address_line1 || city || zip) && (
            <p>
              <span className="font-medium">Address:</span>{" "}
              {address_line1}
              {address_line2 ? `, ${address_line2}` : ""}
              {city ? `, ${city}` : ""}
              {zip ? ` ${zip}` : ""}
            </p>
          )}
          {typeof total === "number" && (
            <p>
              <span className="font-medium">Estimated total:</span>{" "}
              ${total.toFixed(2)}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-full bg-orange-500 text-black text-sm font-semibold py-2.5"
          >
            Back to HaRC home
          </button>
          <button
            type="button"
            onClick={() => navigate("/delivery")}
            className="w-full rounded-full border border-slate-300 text-sm font-medium py-2.5 text-slate-700"
          >
            Start another delivery request
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryConfirm;
