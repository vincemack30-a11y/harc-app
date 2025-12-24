// src/context/CartContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Cart item shape (flexible):
 * { id, name, price, qty, desc?, ... }
 */

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Canonical cart state: array of items
  const [cart, setCart] = useState([]);

  // Convenience alias many pages expect
  const items = cart;

  function addItem(item) {
    if (!item) return;

    setCart((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const id = item.id ?? item.item_id ?? item.sku ?? item.name;

      // If we cannot identify the item, ignore safely
      if (!id) return next;

      const idx = next.findIndex((x) => (x.id ?? x.item_id ?? x.sku ?? x.name) === id);
      if (idx >= 0) {
        const current = next[idx];
        next[idx] = { ...current, qty: Number(current.qty || 0) + 1 };
        return next;
      }

      next.push({
        ...item,
        id: item.id ?? id,
        qty: Number(item.qty || 1),
      });

      return next;
    });
  }

  function removeItem(id) {
    if (!id) return;
    setCart((prev) => (Array.isArray(prev) ? prev.filter((x) => (x.id ?? x.name) !== id) : []));
  }

  function setQty(id, qty) {
    if (!id) return;
    const q = Number(qty || 0);

    setCart((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const idx = next.findIndex((x) => (x.id ?? x.name) === id);
      if (idx < 0) return next;

      if (q <= 0) {
        next.splice(idx, 1);
        return next;
      }

      next[idx] = { ...next[idx], qty: q };
      return next;
    });
  }

  function clearCart() {
    setCart([]);
  }

  const value = useMemo(
    () => ({
      // Common patterns supported:
      cart,        // array
      setCart,     // function (Menu.jsx needs this)
      items,       // alias for cart
      addItem,     // preferred helper
      removeItem,
      setQty,
      clearCart,
    }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
