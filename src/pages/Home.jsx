// src/pages/Home.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { COOLERS, ORANGE } from "../data.js";
import { useApp } from "../AppContext.jsx";
import { setActiveCoolerId as persistCoolerId, getActiveCoolerId } from "../lib/activeCooler.js";

export default function Home() {
  const navigate = useNavigate();

  // SAFETY: do NOT crash if Home renders outside <AppProvider>
  let ctx = null;
  try {
    ctx = useApp();
  } catch {
    ctx = null;
  }

  const activeCoolerId =
    (ctx && ctx.activeCoolerId) || getActiveCoolerId() || "";

  const setActiveCoolerId =
    (ctx && typeof ctx.setActiveCoolerId === "function" && ctx.setActiveCoolerId) ||
    null;

  const coolers = useMemo(() => {
    return Array.isArray(COOLERS) ? COOLERS : [];
  }, []);

  function selectCooler(coolerId) {
    const id = String(coolerId);

    // 1) Persist for reloads (single source for localStorage)
    persistCoolerId(id);

    // 2) Update app state if context exists
    if (setActiveCoolerId) {
      setActiveCoolerId(id);
    }

    // 3) Navigate to menu with query param
    navigate(`/menu?cooler_id=${encodeURIComponent(id)}`);
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: ORANGE?.text || "#111",
          }}
        >
          Select a cooler
        </div>
        <div style={{ marginTop: 6, color: "#6B7280" }}>
          Choose a location to browse the menu and place an order.
        </div>

        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            border: `1px solid ${ORANGE?.border || "#E5E7EB"}`,
            borderRadius: 12,
            background: ORANGE?.bg || "#FFF7ED",
            color: ORANGE?.text || "#111",
            fontSize: 13,
          }}
        >
          Current selection: <b>{activeCoolerId ? String(activeCoolerId) : "None"}</b>
        </div>

        {/* Optional: show if we’re not inside provider (useful for debugging) */}
        {!ctx ? (
          <div style={{ marginTop: 8, color: "#9CA3AF", fontSize: 12 }}>
            Note: Home is running without AppProvider (safe fallback enabled).
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {coolers.map((c) => {
          const isActive = String(activeCoolerId || "") === String(c.cooler_id);

          return (
            <button
              key={c.cooler_id}
              type="button"
              onClick={() => selectCooler(c.cooler_id)}
              style={{
                textAlign: "left",
                width: "100%",
                padding: 14,
                borderRadius: 14,
                border: `2px solid ${
                  isActive
                    ? ORANGE?.accent || "#F97316"
                    : ORANGE?.border || "#E5E7EB"
                }`,
                background: "#FFFFFF",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: ORANGE?.text || "#111",
                  }}
                >
                  {c.name}
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    color: isActive ? "#FFFFFF" : ORANGE?.accent || "#F97316",
                    background: isActive
                      ? ORANGE?.accent || "#F97316"
                      : ORANGE?.bg || "#FFF7ED",
                    border: `1px solid ${ORANGE?.border || "#E5E7EB"}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isActive ? "Selected" : "Choose"}
                </div>
              </div>

              <div style={{ marginTop: 6, color: "#6B7280", fontSize: 13 }}>
                {c.address}
              </div>

              {c.notes ? (
                <div style={{ marginTop: 6, color: "#374151", fontSize: 13 }}>
                  <b>Notes:</b> {c.notes}
                </div>
              ) : null}

              <div style={{ marginTop: 8, color: "#9CA3AF", fontSize: 12 }}>
                cooler_id: <code>{c.cooler_id}</code>
              </div>
            </button>
          );
        })}

        {coolers.length === 0 ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              color: "#6B7280",
            }}
          >
            No coolers found. Check <code>src/data.js</code> for the{" "}
            <code>COOLERS</code> array.
          </div>
        ) : null}
      </div>
    </div>
  );
}
