// src/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="pt-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        Welcome to HaRC Healthy Coolers
      </h1>

      <p className="text-slate-700 text-sm mb-6">
        Pick a cooler location to begin your order.
      </p>

      <div className="space-y-3">
        <Link
          to="/coolers/1"
          className="block bg-white border border-slate-200 rounded-xl p-4 shadow hover:shadow-md transition"
        >
          <p className="text-slate-900 font-semibold">Cooler #1</p>
          <p className="text-xs text-slate-500">Detroit Eastside</p>
        </Link>

        <Link
          to="/coolers/2"
          className="block bg-white border border-slate-200 rounded-xl p-4 shadow hover:shadow-md transition"
        >
          <p className="text-slate-900 font-semibold">Cooler #2</p>
          <p className="text-xs text-slate-500">Clinic / Community Site</p>
        </Link>
      </div>
    </div>
  );
}
