// src/pages/Confirm.jsx
import React from "react";
import { Link } from "react-router-dom";
import donateBanner from "../assets/authority-donate-banner.jpg";

const DONATE_URL = "https://authorityhealth.org/donate/";

function Confirm() {
  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="section-title">Order received</h2>
        <p className="section-subtitle">
          Thank you for using a HaRC Healthy Cooler. Your order has been
          submitted to the cooler — please pick up your items at the machine.
        </p>

        <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
          <li>Go to the selected cooler location.</li>
          <li>Follow on-screen directions at the machine to retrieve items.</li>
          <li>
            Complete the HaRC survey to help improve food options in your
            neighborhood.
          </li>
        </ul>

        <div className="mt-4">
          <Link
            to="/coolers"
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            Find another cooler
          </Link>
        </div>
      </section>

      {/* This page owns the donate banner */}
      <section className="card flex flex-col items-center gap-3 text-center text-xs text-slate-700">
        <a href={DONATE_URL} target="_blank" rel="noreferrer" className="block">
          <img
            src={donateBanner}
            alt="Authority Health - Donate Now"
            className="max-h-20 w-auto object-contain"
          />
        </a>
        <p>
          Donations help Authority Health continue providing care and healthy
          food access for Detroit residents who need it most.
        </p>
      </section>
    </div>
  );
}

export default Confirm;
