import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";

import { COOLERS, MENU } from "./data";

import Home from "./pages/Home.jsx";
import Coolers from "./pages/Coolers.jsx";
import MenuPage from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import OrderConfirm from "./pages/OrderConfirm.jsx";
import Survey from "./pages/Survey.jsx";
import Help from "./pages/Help.jsx";

import Manager from "./pages/Manager.jsx";
import Analytics from "./pages/Analytics.jsx";
import Status from "./pages/Status.jsx";

export default function App() {
  const navigate = useNavigate();

  // --- App state (simple + reliable)
  const [selectedCoolerId, setSelectedCoolerId] = useState("");
  const [cart, setCart] = useState([]); // { sku, name, price, qty }
  const [lastOrder, setLastOrder] = useState(null); // { order_id, cooler_id, total, items }

  const selectedCooler = useMemo(() => {
    return COOLERS.find((c) => c.cooler_id === selectedCoolerId) || null;
  }, [selectedCoolerId]);

  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + (i.qty || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0),
    [cart]
  );

  function addToCart(item) {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.sku === item.sku);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { sku: item.sku, name: item.name, price: item.price, qty: 1 }];
    });
  }

  function decFromCart(sku) {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.sku === sku);
      if (idx < 0) return prev;
      const next = [...prev];
      const qty = (next[idx].qty || 0) - 1;
      if (qty <= 0) return next.filter((p) => p.sku !== sku);
      next[idx] = { ...next[idx], qty };
      return next;
    });
  }

  function clearCart() {
    setCart([]);
  }

  function pickCooler(cooler_id) {
    setSelectedCoolerId(cooler_id);
    setCart([]);
    setLastOrder(null);
    navigate("/menu");
  }

  const ctx = {
    COOLERS,
    MENU,
    selectedCoolerId,
    selectedCooler,
    setSelectedCoolerId,
    cart,
    setCart,
    addToCart,
    decFromCart,
    clearCart,
    cartCount,
    cartTotal,
    lastOrder,
    setLastOrder,
    pickCooler,
  };

  return (
    <div className="container">
      <div className="topbar">
        <Link to="/" className="pill">
          <strong>HaRC Healthy Coolers</strong>
        </Link>

        <div className="row" style={{ alignItems: "center" }}>
          <span className="pill">
            Cooler:{" "}
            <strong>{selectedCooler ? selectedCooler.name : "Not selected"}</strong>
          </span>
          <Link to="/cart" className="btn">
            Cart <span className="badge">{cartCount}</span>
          </Link>
          <Link to="/manager" className="btn">
            Manager
          </Link>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home ctx={ctx} />} />
        <Route path="/coolers" element={<Coolers ctx={ctx} />} />
        <Route path="/menu" element={<MenuPage ctx={ctx} />} />
        <Route path="/cart" element={<Cart ctx={ctx} />} />
        <Route path="/confirm" element={<OrderConfirm ctx={ctx} />} />
        <Route path="/survey" element={<Survey ctx={ctx} />} />
        <Route path="/help" element={<Help ctx={ctx} />} />

        <Route path="/manager" element={<Manager />} />
        <Route path="/manager/analytics" element={<Analytics ctx={ctx} />} />
        <Route path="/manager/status" element={<Status ctx={ctx} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
