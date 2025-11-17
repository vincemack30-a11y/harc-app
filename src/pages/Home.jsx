// src/pages/Home.jsx
import React from "react";

function Home() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome to HaRC Healthy Coolers</h2>
      <p className="text-gray-700">
        Find healthy meals, order from nearby cooler locations, complete your survey,
        and connect with community health resources.
      </p>

      <div className="mt-6 space-y-3">
        <div className="p-4 bg-white rounded-xl shadow">
          <p className="font-semibold">Step 1: Find a Cooler</p>
          <p className="text-sm text-gray-600">Browse coolers by location.</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="font-semibold">Step 2: Choose Items</p>
          <p className="text-sm text-gray-600">Add fresh meals to your cart.</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="font-semibold">Step 3: Checkout</p>
          <p className="text-sm text-gray-600">Finish your order quickly.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
