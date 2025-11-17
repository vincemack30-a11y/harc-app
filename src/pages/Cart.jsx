// src/pages/Cart.jsx
import React from "react";
import { MENU_ITEMS } from "../data";

export default function Cart() {
  // For now, pretend first 2 items are in the cart
  const cartItems = MENU_ITEMS.slice(0, 2);
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart (Preview)</h2>
      <p className="text-sm text-gray-700 mb-4">
        This is a preview of what ordering will look like. Online ordering is
        not live yet.
      </p>

      <section className="space-y-4">
        {cartItems.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  1 x ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </article>
        ))}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Total (preview)</span>
          <span className="font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          disabled
          className="w-full rounded-full bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 cursor-not-allowed"
        >
          Checkout (coming soon)
        </button>
      </section>
    </main>
  );
}
