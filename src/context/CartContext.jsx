import { createContext, useContext, useMemo, useState } from "react";
import { MENU } from "../data.js";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [cooler, setCooler] = useState(null);
  const [cart, setCart] = useState([]); // [{id, qty}]
  const [survey, setSurvey] = useState({ rating: "", wouldRecommend: "", notes: "" });

  const total = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const item = MENU.find((m) => m.id === line.id);
        return sum + (item ? item.price * line.qty : 0);
      }, 0),
    [cart]
  );

  function add(id) {
    setCart((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { id, qty: 1 }];
    });
  }

  function dec(id) {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function removeLine(id) {
    setCart((prev) => prev.filter((l) => l.id !== id));
  }

  function resetAll() {
    setCooler(null);
    setCart([]);
    setSurvey({ rating: "", wouldRecommend: "", notes: "" });
  }

  const value = { cooler, setCooler, cart, add, dec, removeLine, total, survey, setSurvey, resetAll };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
