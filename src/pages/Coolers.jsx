// src/pages/Coolers.jsx
import React from "react";
import { Link } from "react-router-dom";
import { COOLERS } from "../data.js";

function Coolers() {
  // Sort by name so it feels organized
  const coolers = [...COOLERS].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="section-title">Cooler Locations</h2>
        <p className="section-subtitle">
          Choose a HaRC Healthy Cooler near you to view the menu and start an
          order.
        </p>

        {coolers.length === 0 ? (
          <p className="text-sm text-slate-600">
            Cooler locations will appear here as they are added.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {coolers.map((cooler) => (
              <div
                key={cooler.id}
                className="rounded-2xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    {cooler.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {cooler.address}
                    {cooler.city && ` · ${cooler.city}`}
                    {cooler.zip && ` ${cooler.zip}`}
                  </p>
                  {cooler.notes && (
                    <p className="mt-2 text-xs text-slate-500">
                      {cooler.notes}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {cooler.zip && (
                      <span className="chip">ZIP {cooler.zip}</span>
                    )}
                    {cooler.status && (
                      <span className="chip">
                        {cooler.status === "open" ? "Open now" : cooler.status}
                      </span>
                    )}
                    {cooler.type && (
                      <span className="chip">{cooler.type}</span>
                    )}
                  </div>

                  <Link
                    to={`/menu/${cooler.id}`}
                    className="ml-2 inline-flex items-center rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                  >
                    View menu →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Coolers;
