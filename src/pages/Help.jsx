// src/pages/Help.jsx
import React from "react";
import authorityLogo from "../assets/authority-health-centers.png";

const FB_URL = "https://www.facebook.com/detroitauthorityhealth/";
const IG_URL = "https://www.instagram.com/authority_health/";
const DONATE_URL = "https://authorityhealth.org/donate/";

function Help() {
  return (
    <div className="space-y-6">
      {/* This page owns the Authority Health Centers logo */}
      <section className="card flex flex-col items-start gap-3 md:flex-row md:items-center">
        <img
          src={authorityLogo}
          alt="Authority Health Centers"
          className="h-16 w-auto object-contain"
        />
        <div>
          <h2 className="section-title mb-1">Need help or have questions?</h2>
          <p className="section-subtitle">
            Authority Health community health workers and care teams are here to
            support you.
          </p>
        </div>
      </section>

      <section className="card space-y-3 text-sm text-slate-700">
        <h3 className="font-semibold text-slate-800">Contact & support</h3>
        <p>
          For help with HaRC Healthy Coolers, food access, or primary care,
          please contact Authority Health:
        </p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>Phone: <span className="font-semibold">313-871-3751</span></li>
          <li>Website: <a href="https://authorityhealth.org" className="underline text-orange-600" target="_blank" rel="noreferrer">authorityhealth.org</a></li>
        </ul>
      </section>

      <section className="card space-y-3 text-sm text-slate-700">
        <h3 className="font-semibold text-slate-800">Connect on social</h3>
        <p className="text-xs">
          Follow Authority Health to see updates on HaRC events, healthy food
          options, and community resources.
        </p>

        <div className="flex flex-wrap gap-2">
          <a
            href={FB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Facebook
          </a>
          <a
            href={IG_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Instagram
          </a>
        </div>
      </section>

      <section className="card space-y-3 text-xs text-slate-700">
        <h3 className="font-semibold text-slate-800">Support the mission</h3>
        <p>
          Over half of Authority Health patients cannot afford deductibles or
          copays. Donations help keep care and healthy food initiatives
          available for the community.
        </p>
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
        >
          Donate to Authority Health
        </a>
      </section>
    </div>
  );
}

export default Help;
