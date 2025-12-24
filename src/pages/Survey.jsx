// src/pages/Survey.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ORANGE, SURVEY_URL } from "../data.js";

export default function Survey() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: ORANGE.bg,
        color: ORANGE.text,
        padding: 18,
      }}
    >
      <div
        style={{
          maxWidth: 840,
          margin: "0 auto",
          background: ORANGE.card,
          border: `1px solid ${ORANGE.border}`,
          borderRadius: 18,
          padding: 18,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22 }}>Quick Survey</h2>
        <p style={{ marginTop: 10, lineHeight: 1.4 }}>
          Thanks for helping Authority Health improve HaRC Healthy Coolers.
        </p>

        <a
          href={SURVEY_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "12px 14px",
            borderRadius: 12,
            background: ORANGE.accent,
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Open Survey (MPHI)
        </a>

        <div style={{ marginTop: 18 }}>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${ORANGE.border}`,
              color: ORANGE.text,
              textDecoration: "none",
              fontWeight: 700,
              background: "#fff",
            }}
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
