// src/pages/Menu.jsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import { MENU, COOLERS } from "../data.js";
import { useCart } from "../context/CartContext.jsx";

function Menu() {
  const { coolerId } = useParams();
  const { addToCart } = useCart();

  const cooler = COOLERS.find((c) => String(c.id) === String(coolerId));

  // If MENU items have a coolerId field, filter by it; otherwise show all.
  const items = MENU.filter((item) => {
    if (item.coolerId == null) return true;
    return String(item.coolerId) === String(coolerId);
  });

  const handleAdd = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      quantity: 1,
      coolerId: coolerId || item.coolerId,
    });
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="section-title">
              {cooler ? cooler.name : "Menu"}
            </h2>
            {cooler && (
              <p className="section-subtitle">
                {cooler.address}
                {cooler.city && ` · ${cooler.city}`}
                {cooler.zip && ` ${cooler.zip}`}
              </p>
            )}
          </div>

          <Link
            to="/coolers"
            className="hidden md:inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            ← Back to coolers
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-600 mt-2">
            No items found for this cooler yet. Please check back soon.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-600 mb-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.calories && (
                      <span className="chip">{item.calories} cal</span>
                    )}
                    {item.category && (
                      <span className="chip">{item.category}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    {item.price != null && (
                      <span className="text-sm font-semibold text-slate-900">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                    {item.tags && (
                      <span className="text-[10px] text-slate-500 mt-1">
                        {item.tags}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/cart"
            className="inline-flex items-center rounded-full bg-black text-white px-4 py-1.5 text-xs font-semibold"
          >
            View cart &amp; checkout
          </Link>
          <Link
            to="/survey"
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            Complete HaRC survey
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Menu;
