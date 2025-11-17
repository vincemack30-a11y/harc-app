// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import harcLogo from "../assets/harc-logo.png";

const HARC_URL =
  "https://authorityhealth.org/harc-community-partners-locations/";
const DONATE_URL = "https://authorityhealth.org/donate/";

function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* HaRC banner/logo – ONLY logo on this page */}
      <section>
        <a href={HARC_URL} target="_blank" rel="noreferrer">
          <img
            src={harcLogo}
            alt="Click the HaRC link to learn about Healthy and Resilient Communities"
            style={{
              width: "100%",
              maxHeight: "140px",
              objectFit: "contain",
              marginBottom: "4px",
            }}
          />
        </a>
      </section>

      {/* Hero copy */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #f97316 0%, #fb923c 40%, #22c55e 100%)",
          color: "#ffffff",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginBottom: "4px",
          }}
        >
          HaRC Healthy Coolers
        </p>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            margin: "0 0 8px 0",
          }}
        >
          Fresh, healthy grab-and-go in your neighborhood.
        </h1>
        <p
          style={{
            fontSize: "13px",
            maxWidth: "480px",
            margin: "0 0 10px 0",
          }}
        >
          Find nearby HaRC Healthy Coolers, choose fresh items, complete your
          survey, and connect with community health workers for extra support.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <Link
            to="/coolers"
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Find a cooler
          </Link>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "#b45309",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Make a donation
          </a>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            marginBottom: "4px",
            color: "#0f172a",
          }}
        >
          How it works
        </h2>
        <p
          style={{
            fontSize: "12px",
            color: "#64748b",
            marginBottom: "10px",
          }}
        >
          Simple steps to get healthy food and stay connected with care.
        </p>

        <div
          style={{
            display: "grid",
            gap: "10px",
          }}
        >
          {[
            {
              step: "Step 1",
              title: "Find a cooler",
              body: "Browse HaRC Healthy Cooler locations near home, work, or school.",
            },
            {
              step: "Step 2",
              title: "Choose items",
              body: "Add fresh meals, snacks, and drinks to your cart. Review nutrition details as you go.",
            },
            {
              step: "Step 3",
              title: "Checkout & share feedback",
              body: "Complete your order, then take our short survey to help us improve food options and services.",
            },
          ].map((card) => (
            <div
              key={card.step}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                padding: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#f97316",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                {card.step}
              </p>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "2px",
                  color: "#0f172a",
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          fontSize: "11px",
          color: "#64748b",
        }}
      >
        Powered by Authority Health’s Healthy &amp; Resilient Communities (HaRC)
        initiative to bring healthy “grab and go” foods into Detroit
        neighborhoods.
      </section>
    </div>
  );
}

export default Home;
