// src/pages/Coolers.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { COOLERS, ORANGE } from "../data.js";
import { setActiveCoolerId } from "../lib/activeCooler.js";

export default function Coolers() {
  const navigate = useNavigate();

  function pickCooler(c) {
    // Persist + route with query param
    setActiveCoolerId(c.cooler_id);
    navigate(`/menu?cooler_id=${encodeURIComponent(c.cooler_id)}`);
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: ORANGE.text }}>Coolers</h1>
      <p style={{ marginTop: 6, color: ORANGE.subtext }}>
        Select a location to browse the menu and place an order.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {COOLERS.map((c) => (
          <button
            key={c.cooler_id}
            type="button"
            onClick={() => pickCooler(c)}
            style={{
              textAlign: "left",
              padding: 14,
              borderRadius: 14,
              border: `2px solid ${ORANGE.border}`,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 900, color: ORANGE.text }}>{c.name}</div>
            <div style={{ marginTop: 4, color: ORANGE.subtext }}>{c.address}</div>
            {c.notes ? (
              <div style={{ marginTop: 6, fontSize: 12, color: ORANGE.accentDark }}>
                {c.notes}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
