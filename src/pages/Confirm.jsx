// src/pages/Confirm.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

function Confirm() {
  const { items, totalItems, clearCart } = useCart();

  // Clear the cart once the user lands on this page
  useEffect(() => {
    if (items.length > 0) {
      clearCart();
    }
  }, []); // run once

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Order Confirmed ✅</h2>

      <p className="text-gray-700 mb-4">
        Thank you for using the HaRC Healthy Coolers app.
      </p>

      <p className="text-gray-600 mb-6">
        Your selections have been sent to the cooler. Please follow on-screen
        instructions at the cooler to complete pickup and payment.
      </p>

      <div className="p-4 bg-white rounded-xl shadow mb-6">
        <p className="font-semibold mb-1">Summary</p>
        <p className="text-sm text-gray-600">
          Items in order: <span className="font-semibold">{totalItems}</span>
        </p>
      </div>

      <Link
        to="/coolers"
        className="inline-block px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold"
      >
        Back to Coolers
      </Link>
    </div>
  );
}

export default Confirm;
