import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MENU } from "../data"; // <-- IMPORTANT: go up one level

const Menu = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  // Add item or increase qty
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: (p.qty || 0) + 1 } : p
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  // Decrease qty or remove item
  const handleRemoveFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === itemId);
      if (!existing) return prev;

      if ((existing.qty || 1) <= 1) {
        return prev.filter((p) => p.id !== itemId);
      }

      return prev.map((p) =>
        p.id === itemId ? { ...p, qty: (p.qty || 1) - 1 } : p
      );
    });
  };

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice =
      typeof item.price === "string"
        ? parseFloat(item.price)
        : item.price || 0;
    return sum + unitPrice * (item.qty || 1);
  }, 0);

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.qty || 1),
    0
  );

  const handleViewCart = () => {
    if (!cart.length) return;
    navigate("/cart", {
      state: {
        cart,
        subtotal,
        totalItems,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
            HaRC Healthy Coolers
          </p>
          <h1 className="text-xl font-semibold mt-1">
            Pick your healthy snacks
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs border border-slate-700 px-3 py-1 rounded-full"
        >
          Back
        </button>
      </header>

      {/* Menu grid */}
      <main className="flex-1 px-4 pt-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {MENU.map((item) => {
            const inCart = cart.find((c) => c.id === item.id);
            const unitPrice =
              typeof item.price === "string"
                ? parseFloat(item.price)
                : item.price || 0;

            return (
              <button
                key={item.id ?? item.name}
                type="button"
                onClick={() => handleAddToCart(item)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col items-start text-left"
              >
                <div className="w-full h-20 bg-slate-800 rounded-xl mb-3 flex items-center justify-center text-[10px] uppercase tracking-wide">
                  {item.category || "Healthy Option"}
                </div>

                <p className="text-xs font-semibold line-clamp-2">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {item.description || "Great for on-the-go energy."}
                </p>

                <div className="mt-2 flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-orange-400">
                    ${unitPrice.toFixed(2)}
                  </span>

                  {inCart?.qty ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromCart(item.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-700 text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs">{inCart.qty}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500/80 text-black text-xs"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Tap to add
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Sticky cart footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
        <button
          disabled={!cart.length}
          onClick={handleViewCart}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold flex items-center justify-between ${
            cart.length
              ? "bg-orange-500 text-black"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="text-[11px] uppercase tracking-[0.18em]">
              {cart.length ? "Review cart" : "Cart empty"}
            </span>
            <span className="text-xs">
              {cart.length
                ? `${totalItems} item${totalItems === 1 ? "" : "s"} selected`
                : "Add items to continue"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs block">
              {cart.length ? "Estimated total" : "—"}
            </span>
            <span className="text-sm font-bold">
              {cart.length ? `$${subtotal.toFixed(2)}` : "$0.00"}
            </span>
          </div>
        </button>
      </footer>
    </div>
  );
};

export default Menu;
