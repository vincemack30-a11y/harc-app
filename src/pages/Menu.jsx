// src/pages/Menu.jsx
import React, { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { COOLERS, MENU, ORANGE } from "../data.js";
import { useApp } from "../AppContext.jsx";
import { useCart } from "../CartContext.jsx"; // shim -> ./context/CartContext.jsx

export default function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // App state (cooler selection)
  const { activeCoolerId, setActiveCoolerId } = useApp();

  // Cart state (real cart)
  const { cart, setCart } = useCart();

  // Resolve cooler ONCE (no side effects)
  const resolvedCoolerId = searchParams.get("cooler_id") || activeCoolerId || "";

  const activeCooler = useMemo(() => {
    return COOLERS.find((c) => c.cooler_id === resolvedCoolerId) || null;
  }, [resolvedCoolerId]);

  const visibleMenu = useMemo(() => {
    if (!resolvedCoolerId) return [];
    return MENU.filter((m) => !m.cooler_ids || m.cooler_ids.includes(resolvedCoolerId));
  }, [resolvedCoolerId]);

  // Hard guard — redirect only if truly missing
  if (!resolvedCoolerId) {
    navigate("/coolers", { replace: true });
    return null;
  }

  function addToCart(item) {
    // Keep your existing cart model: [{ id, qty }]
    const next = Array.isArray(cart) ? [...cart] : [];

    const existing = next.find((r) => r.id === item.id);
    if (existing) {
      existing.qty = Number(existing.qty || 0) + 1;
    } else {
      next.push({ id: item.id, qty: 1 });
    }

    setCart(next);
    setActiveCoolerId(resolvedCoolerId);
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: ORANGE.text }}>Menu</h1>
          <div style={{ marginTop: 4, color: ORANGE.subtext }}>
            Cooler: <strong>{activeCooler?.name}</strong>
          </div>
        </div>

        <Link
          to={`/cart?cooler_id=${encodeURIComponent(resolvedCoolerId)}`}
          style={{
            alignSelf: "center",
            padding: "10px 12px",
            borderRadius: 12,
            border: `2px solid ${ORANGE.border}`,
            background: "#fff",
            color: ORANGE.accent,
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Go to Cart
        </Link>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {visibleMenu.map((item) => (
          <div
            key={item.id}
            style={{
              border: `1px solid ${ORANGE.border}`,
              background: "#fff",
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 900 }}>{item.name}</div>
            <div style={{ marginTop: 4, color: ORANGE.subtext }}>{item.desc}</div>
            <div style={{ marginTop: 8, fontWeight: 900 }}>
              ${Number(item.price).toFixed(2)}
            </div>

            <button
              type="button"
              onClick={() => addToCart(item)}
              style={{
                marginTop: 10,
                padding: "10px 12px",
                borderRadius: 12,
                border: `2px solid ${ORANGE.accent}`,
                background: ORANGE.bg,
                color: ORANGE.accentDark,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <Link to="/coolers" style={{ color: ORANGE.accent, fontWeight: 900 }}>
          Change cooler
        </Link>
      </div>
    </div>
  );
}
