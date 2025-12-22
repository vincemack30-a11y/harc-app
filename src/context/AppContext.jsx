// src/context/AppContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Selected cooler (object from COOLERS)
  const [selectedCooler, setSelectedCooler] = useState(null);

  // Cart is { [menuItemId]: qty }
  const [cart, setCart] = useState({});

  // Simple survey capture (optional internal survey)
  const [survey, setSurvey] = useState({
    feeling: "",
    speed: "",
    comment: "",
  });

  // Order receipt payload (for confirmation screen)
  const [lastOrder, setLastOrder] = useState(null);

  const addToCart = (itemId, qty = 1) => {
    setCart((prev) => {
      const next = { ...prev };
      next[itemId] = (next[itemId] || 0) + qty;
      if (next[itemId] <= 0) delete next[itemId];
      return next;
    });
  };

  const setCartQty = (itemId, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  };

  const clearCart = () => setCart({});

  const value = useMemo(
    () => ({
      selectedCooler,
      setSelectedCooler,
      cart,
      addToCart,
      setCartQty,
      clearCart,
      survey,
      setSurvey,
      lastOrder,
      setLastOrder,
    }),
    [selectedCooler, cart, survey, lastOrder]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider />");
  return ctx;
};
