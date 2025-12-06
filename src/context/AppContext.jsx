// src/context/AppContext.jsx
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [survey, setSurvey] = useState({});
  const [user] = useState({
    id: "demo-user-1",
    name: "HaRC Demo User",
  });

  function addToCart(item) {
    setCart((prev) => [...prev, item]);
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((item, index) => index !== id && item.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  function saveSurvey(data) {
    setSurvey(data);
  }

  const value = {
    user,
    cart,
    survey,
    addToCart,
    removeFromCart,
    clearCart,
    saveSurvey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}
