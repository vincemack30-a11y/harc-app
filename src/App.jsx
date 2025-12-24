// src/App.jsx
import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { COOLERS, MENU } from "./data.js";

// Pages (based on your tree: these are in src/pages)
import Survey from "./pages/Survey.jsx";
import Help from "./pages/Help.jsx";
import Cart from "./pages/Cart.jsx";
import OrderConfirm from "./pages/OrderConfirm.jsx";

// Manager files (based on your tree: these are in src root)
import ManagerPin from "./ManagerPin.jsx";
import ManagerAnalytics from "./ManagerAnalytics.jsx";

export default function App() {
  // ---- Core state ----
  const [selectedCoolerId, setSelectedCoolerId] = useState("");
  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  // keep this for ManagerPin / ManagerAnalytics flows if they use it
  const [managerUnlocked, setManagerUnlocked] = useState(false);

  const selectedCooler = useMemo(() => {
    return COOLERS.find((c) => c.cooler_id === selectedCoolerId) || null;
  }, [selectedCoolerId]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
      0
    );
  }, [cart]);

  // ---- Cart helpers ----
  const addToCart = (item) => {
    setCart((prev) => {
      const sku = item.sku ?? item.id;
      const idx = prev.findIndex((x) => (x.sku ?? x.id) === sku);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Number(next[idx].qty || 0) + 1 };
        return next;
      }
      return [...prev, { ...item, sku, qty: 1 }];
    });
  };

  const decFromCart = (skuOrId) => {
    setCart((prev) => {
      const sku = skuOrId;
      const idx = prev.findIndex((x) => (x.sku ?? x.id) === sku);
      if (idx < 0) return prev;

      const current = prev[idx];
      const nextQty = Number(current.qty || 0) - 1;

      if (nextQty <= 0) {
        return prev.filter((x) => (x.sku ?? x.id) !== sku);
      }

      const next = [...prev];
      next[idx] = { ...current, qty: nextQty };
      return next;
    });
  };

  const clearCart = () => setCart([]);

  // ---- ctx passed to your existing pages ----
  const ctx = useMemo(
    () => ({
      // Cooler selection
      selectedCooler,
      selectedCoolerId,
      setSelectedCoolerId,

      // Cart
      cart,
      cartTotal,
      addToCart,
      decFromCart,
      clearCart,

      // Order confirmation
      lastOrder,
      setLastOrder,

      // Manager
      managerUnlocked,
      setManagerUnlocked,
    }),
    [
      selectedCooler,
      selectedCoolerId,
      cart,
      cartTotal,
      lastOrder,
      managerUnlocked,
    ]
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/coolers" replace />} />

      <Route path="/coolers" element={<CoolersPage ctx={ctx} />} />
      <Route path="/menu" element={<MenuPage ctx={ctx} />} />

      {/* Existing pages you already have */}
      <Route path="/cart" element={<Cart ctx={ctx} />} />
      <Route path="/confirm" element={<OrderConfirm ctx={ctx} />} />
      <Route path="/survey" element={<Survey ctx={ctx} />} />
      <Route path="/help" element={<Help ctx={ctx} />} />

      {/* Manager */}
      <Route path="/manager" element={<ManagerPin ctx={ctx} />} />
      <Route path="/manager/analytics" element={<ManagerAnalytics ctx={ctx} />} />

      <Route path="*" element={<Navigate to="/coolers" replace />} />
    </Routes>
  );
}

/* -----------------------------
   UI: Coolers
------------------------------ */
function CoolersPage({ ctx }) {
  const nav = useNavigate();
  const { selectedCoolerId, setSelectedCoolerId, cart } = ctx;

  const selectCooler = (cooler_id) => {
    setSelectedCoolerId(cooler_id);
    nav("/menu");
  };

  return (
    <div className="card">
      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <h1 className="h1">HaRC Healthy Coolers</h1>
          <p className="h2">
            Select a cooler location to view the menu and order.
          </p>
        </div>

        {/* ✅ Buttons restored */}
        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
          <Link to="/help" className="btn">
            Get Help
          </Link>
          <Link to="/manager" className="btn">
            Manager
          </Link>
          <Link
            to="/cart"
            className="btn btn-primary"
            style={{
              opacity: cart.length ? 1 : 0.55,
              pointerEvents: cart.length ? "auto" : "none",
            }}
          >
            Checkout ({cart.length})
          </Link>
        </div>
      </div>

      <hr className="hr" />

      <div style={{ display: "grid", gap: 12 }}>
        {COOLERS.map((c) => {
          const selected = c.cooler_id === selectedCoolerId;

          return (
            <div
              key={c.cooler_id}
              className="card"
              style={{
                borderRadius: 14,
                border: selected ? "2px solid #F97316" : undefined,
              }}
            >
              <div style={{ fontWeight: 900 }}>{c.name}</div>
              <div className="small">{c.address}</div>

              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => selectCooler(c.cooler_id)}
                >
                  {selected ? "Selected (Go to Menu)" : "Select & View Menu"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -----------------------------
   UI: Menu
------------------------------ */
function MenuPage({ ctx }) {
  const nav = useNavigate();
  const { selectedCooler, cart, addToCart } = ctx;

  if (!selectedCooler) {
    return (
      <div className="card">
        <h1 className="h1">Menu</h1>
        <p className="h2">Select a cooler first.</p>
        <hr className="hr" />
        <Link to="/coolers" className="btn btn-primary">
          Go to Coolers
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <h1 className="h1">Menu</h1>
          <p className="h2">
            {selectedCooler.name} — add items to your cart.
          </p>
        </div>

        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => nav("/coolers")}>
            Change Cooler
          </button>
          <Link
            to="/cart"
            className="btn btn-primary"
            style={{
              opacity: cart.length ? 1 : 0.55,
              pointerEvents: cart.length ? "auto" : "none",
            }}
          >
            Checkout ({cart.length})
          </Link>
        </div>
      </div>

      <hr className="hr" />

      <div style={{ display: "grid", gap: 10 }}>
        {MENU.map((m) => (
          <div key={m.sku ?? m.id} className="card" style={{ borderRadius: 14 }}>
            <div style={{ fontWeight: 900 }}>{m.name}</div>
            <div className="small">${Number(m.price || 0).toFixed(2)}</div>

            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn btn-green" onClick={() => addToCart(m)}>
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr className="hr" />

      <div className="row">
        <Link to="/help" className="btn">
          Need Help?
        </Link>
      </div>
    </div>
  );
}
