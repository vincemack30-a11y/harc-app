// src/pages/Menu.jsx
import React from "react";
import { MENU } from "../data.js";

function MenuPage({ cart, setCart, selectedCooler }) {
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Menu</h2>

      {selectedCooler ? (
        <p className="text-xs mb-3">
          Cooler: <strong>{selectedCooler.name}</strong>
        </p>
      ) : (
        <p className="text-xs mb-3 bg-white/60 px-3 py-2 rounded">
          No cooler selected yet. You can still order, but for the best
          experience pick your location on the <strong>Coolers</strong> tab.
        </p>
      )}

      {Array.isArray(MENU) && MENU.length > 0 ? (
        <div className="space-y-2 text-sm">
          {MENU.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white/70 px-3 py-2 rounded border border-gray-300"
            >
              <div>
                <div>{item.name}</div>
                {item.description && (
                  <div className="text-xs opacity-80">
                    {item.description}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold">
                  ${item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="px-2 py-1 rounded bg-black text-white text-xs"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm mt-3">
          No menu items configured yet. (Check the MENU list in src/data.js.)
        </p>
      )}
    </div>
  );
}

export default MenuPage;
