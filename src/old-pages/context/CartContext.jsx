import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MENU } from "../data.js";

const CartCtx = createContext(null);

// Storage keys
const K_COOLER = "HARC_COOLER";
const K_CART = "HARC_CART";
const K_SURVEY = "HARC_SURVEY";

// Safe JSON helpers
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function CartProvider({ children }) {
  // Initial state from localStorage (or defaults)
  const [cooler, setCooler] = useState(() => load(K_COOLER, null));
  const [cart, setCart] = useState(() => load(K_CART, [])); // [{id, qty}]
  const [survey, setSurvey] = useState(() =>
    load(K_SURVEY, { rating: "", wouldRecommend: "", notes: "" })
  );

  // Toasts
  const [toasts, setToasts] = useState([]); // [{id, msg}]
  function addToast(msg) {
    const id = String(Date.now() + Math.random());
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 1800);
  }

  // Derived total
  const total = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const item = MENU.find((m) => m.id === line.id);
        return sum + (item ? item.price * line.qty : 0);
      }, 0),
    [cart]
  );

  // Persist whenever these change
  useEffect(() => save(K_COOLER, cooler), [cooler]);
  useEffect(() => save(K_CART, cart), [cart]);
  useEffect(() => save(K_SURVEY, survey), [survey]);

  // Cart ops
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
    try {
      localStorage.removeItem(K_COOLER);
      localStorage.removeItem(K_CART);
      localStorage.removeItem(K_SURVEY);
    } catch {}
  }

  const value = {
    cooler, setCooler,
    cart, add, dec, removeLine, total,
    survey, setSurvey, resetAll,
    toasts, addToast,
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
