// src/pages/Menu.jsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import { MENU, COOLERS } from "../data.js";
import { useCart } from "../context/CartContext.jsx";

function Menu() {
  const { coolerId } = useParams();
  const { addToCart } = useCart();

  // Try to find the selected cooler (for header display)
  const cooler = COOLERS.find((c) => String(c.id) === String(coolerId));

  // If your MENU items are tied to a coolerId, filter by it.
  // If not, this will just show all items.
  const items = MENU.filter((item) => {
    if (item.coolerId == null) return true;
    return String(item.coolerId) === String(coolerId);
  });

  const handleAdd = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      coolerId: coolerId || item.coolerId,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">
        {cooler ? cooler.name : "Menu"}
      </h2>
      {cooler && (
        <p className="text-sm text-gray-600 mb-4">
          {cooler.address} · {cooler.city} {cooler.zip}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-gray-600">No items found for this cooler.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-1">
                    {item.description}
                  </p>
                )}
                {item.calories && (
                  <p className="text-xs text-gray-500">
                    {item.calories} calories
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold">
                  {item.price ? `$${item.price.toFixed(2)}` : ""}
                </span>
                <button
                  onClick={() => handleAdd(item)}
                  className="px-3 py-1 rounded-lg bg-black text-white text-sm font-semibold"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link
          to="/cart"
          className="inline-block px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}

export default Menu;
