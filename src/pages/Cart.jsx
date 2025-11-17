// src/pages/Cart.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

function Cart() {
  const { items, removeFromCart, clearCart, totalItems } = useCart();

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  if (items.length === 0) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <p className="text-gray-700 mb-4">Your cart is currently empty.</p>
        <Link
          to="/coolers"
          className="inline-block px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold"
        >
          Browse Coolers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white rounded-xl shadow p-3"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              {item.quantity && (
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">
                {item.price
                  ? `$${(item.price * (item.quantity || 1)).toFixed(2)}`
                  : ""}
              </p>
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className="mt-1 text-xs text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white rounded-xl shadow mb-4">
        <p className="font-semibold mb-1">Summary</p>
        <p className="text-sm text-gray-600">
          Items: <span className="font-semibold">{totalItems}</span>
        </p>
        <p className="text-sm text-gray-600">
          Estimated total:{" "}
          <span className="font-semibold">
            {totalPrice ? `$${totalPrice.toFixed(2)}` : "$0.00"}
          </span>
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={clearCart}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
        >
          Clear Cart
        </button>

        <Link
          to="/confirm"
          className="flex-1 text-center px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold"
        >
          Checkout &amp; Confirm
        </Link>
      </div>

      <div className="mt-3">
        <Link to="/survey" className="text-xs text-blue-600 underline">
          Complete your HaRC survey
        </Link>
      </div>
    </div>
  );
}

export default Cart;
