// src/AppContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { COOLERS } from "./data.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [selectedCoolerId, setSelectedCoolerId] = useState(
    COOLERS[0]?.id ?? null
  );
  const [cartItems, setCartItems] = useState([]);

  const selectedCooler =
    COOLERS.find((cooler) => cooler.id === selectedCoolerId) ?? null;

  const setCooler = (coolerId) => {
    setSelectedCoolerId(coolerId);
    // Clear cart whenever the cooler changes so orders stay clean
    setCartItems([]);
  };

  const addToCart = (item) => {
    setCartItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems((current) =>
      current
        .map((entry) =>
          entry.id === itemId
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const value = {
    selectedCooler,
    selectedCoolerId,
    setCooler,
    cartItems,
    addToCart,
    updateQuantity,
    clearCart,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
