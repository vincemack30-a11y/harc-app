// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        Welcome to HaRC Healthy Coolers
      </h1>
      <p className="text-sm text-slate-700 mb-6">
        Pick a cooler location to begin your order, or try the{" "}
        <span className="font-semibold">delivery pilot</span> if you&apos;re
        in our service area.
      </p>

      {/* Cooler links */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          In-person coolers
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to="/menu/cooler_1"
              className="block border border-slate-300 rounded-xl px-3 py-2 hover:bg-orange-50"
            >
              <span className="font-semibold">Cooler #1</span>
              <span className="block text-[11px] text-slate-500">
                Detroit Eastside
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/menu/cooler_2"
              className="block border border-slate-300 rounded-xl px-3 py-2 hover:bg-orange-50"
            >
              <span className="font-semibold">Cooler #2</span>
              <span className="block text-[11px] text-slate-500">
                Clinic / community site
              </span>
            </Link>
          </li>
        </ul>
      </section>

      {/* Delivery pilot */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Delivery pilot (limited)
        </h2>
        <Link
          to="/delivery"
          className="block border border-orange-400 bg-orange-50 rounded-xl px-3 py-3 hover:bg-orange-100"
        >
          <span className="font-semibold text-sm">
            Request HaRC delivery
          </span>
          <span className="block text-[11px] text-orange-700 mt-1">
            Share your address, pick your snacks, and a HaRC team member
            will follow up to confirm eligibility, timing, and payment.
          </span>
        </Link>
      </section>

      <p className="text-[11px] text-slate-500">
        This is a pilot experience for Authority Health&apos;s Healthy &amp;
        Resilient Communities (HaRC) initiative. Final program rules and
        delivery zones may change.
      </p>
    </div>
  );
};

export default Home;
