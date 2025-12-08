// src/AppContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";

// ✅ data.js is in the same folder as this file
import { COOLERS } from "./data";
import { supabase } from "./supabaseClient";

const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  // Which cooler the user picked
  const [selectedCoolerId, setSelectedCoolerId] = useState(
    COOLERS[0]?.id ?? null
  );

  // Cart = array of { id, name, price, qty, cooler_id }
  const [cart, setCart] = useState([]);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const selectedCooler =
    COOLERS.find((cooler) => cooler.id === selectedCoolerId) ?? null;

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.price || 0),
    0
  );

  const addToCart = (menuItem) => {
    if (!menuItem) return;

    setCart((prev) => {
      const existing = prev.find((row) => row.id === menuItem.id);
      if (existing) {
        return prev.map((row) =>
          row.id === menuItem.id
            ? { ...row, qty: (row.qty || 0) + 1 }
            : row
        );
      }

      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          qty: 1,
          cooler_id: selectedCoolerId,
        },
      ];
    });
  };

  const updateCartItemQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: (item.qty || 0) + delta } : item
        )
        .filter((item) => (item.qty || 0) > 0)
    );
  };

  const clearCart = () => setCart([]);

  const submitOrder = async () => {
    if (!cart.length || !selectedCoolerId) return;

    try {
      setIsSubmittingOrder(true);

      const total = cart.reduce(
        (sum, item) => sum + (item.qty || 0) * (item.price || 0),
        0
      );

      const { error } = await supabase.from("orders").insert({
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        total,
        cooler_id: selectedCoolerId,
        source: "harc-app",
      });

      if (error) {
        console.error("Error inserting order:", error);
        throw error;
      }

      clearCart();
      return true;
    } catch (err) {
      console.error("submitOrder failed:", err);
      return false;
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const value = useMemo(
    () => ({
      // data
      selectedCoolerId,
      selectedCooler,
      cart,
      cartCount,
      cartTotal,
      isSubmittingOrder,
      // actions
      setSelectedCoolerId,
      setCart,
      addToCart,
      updateCartItemQty,
      clearCart,
      submitOrder,
    }),
    [
      selectedCoolerId,
      selectedCooler,
      cart,
      cartCount,
      cartTotal,
      isSubmittingOrder,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside <AppContextProvider>");
  }
  return ctx;
}
