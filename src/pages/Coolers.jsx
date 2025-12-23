import React from "react";

export default function Coolers({ ctx }) {
  const { COOLERS, selectedCoolerId, pickCooler } = ctx;

  return (
    <div className="card">
      <h1 className="h1">Select a Cooler</h1>
      <p className="h2">Choose a location to view menu items available for grab-and-go ordering.</p>

      <hr className="hr" />

      <div style={{ display: "grid", gap: 12 }}>
        {COOLERS.map((c) => {
          const active = c.cooler_id === selectedCoolerId;
          return (
            <button
              key={c.cooler_id}
              className={`btn ${active ? "btn-green" : ""}`}
              style={{
                justifyContent: "space-between",
                width: "100%",
                padding: 14,
              }}
              onClick={() => pickCooler(c.cooler_id)}
            >
              <span style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 800 }}>{c.name}</div>
                <div className="small">{c.address}</div>
                <div className="small">{c.notes}</div>
              </span>
              <span className="badge">{c.cooler_id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
