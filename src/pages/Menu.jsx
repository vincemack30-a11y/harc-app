// src/pages/Menu.jsx
import React from "react";
import { MENU_ITEMS } from "../data";

export default function Menu() {
  return (
    <main className="min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu (Preview)</h2>
      <p className="text-sm text-gray-700 mb-4">
        Sample HaRC menu items available in participating coolers.
      </p>

      <section className="space-y-4">
        {MENU_ITEMS.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                    {item.tag}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.calories}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${item.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Ordering coming soon
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
