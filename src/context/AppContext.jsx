// src/context/AppContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";
import { COOLERS, MENU } from "../data";
import { supabase } from "../supabaseClient";

const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  // --- CORE STATE ---

  // Which cooler is selected on the /coolers screen
  const [selectedCoolerId, setSelectedCoolerId] = useState(
    COOLERS[0]?.id ?? null
  );

  // Cart is an array of items: { id, name, price, qty }
  const [cart, setCart] = useState([]);

  // When we’re sending an order to Supabase
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // --- DERIVED STATE ---

  const selectedCooler = useMemo(
    () => COOLERS.find((c) => c.id === selectedCoolerId) ?? null,
    [selectedCoolerId]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty * item.price, 0),
    [cart]
  );

  // --- CART HELPERS ---

  function addToCart(menuItem) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          qty: 1,
        },
      ];
    });
  }

  function updateCartItemQty(itemId, qty) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, qty: Number(qty) || 0 } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  // --- ORDER SUBMISSION TO SUPABASE ---

  async function submitOrder() {
    if (!selectedCoolerId || cart.length === 0) {
      console.warn("[Order] Missing cooler or empty cart, not submitting.");
      return { ok: false, error: "Missing cooler or empty cart" };
    }

    setIsSubmittingOrder(true);

    try {
      const itemsPayload = cart.map(({ id, name, price, qty }) => ({
        id,
        name,
        price,
        qty,
      }));

      const { error } = await supabase.from("orders").insert({
        items: itemsPayload,
        total: cartTotal,
        cooler_id: selectedCoolerId,
        source: "harc-app",
      });

      if (error) throw error;

      clearCart();
      return { ok: true };
    } catch (err) {
      console.error("[Order] Error submitting order:", err);
      return { ok: false, error: err.message ?? "Unknown error" };
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  // --- CONTEXT VALUE ---

  const value = useMemo(
    () => ({
      // state
      selectedCoolerId,
      selectedCooler,
      cart,
      cartCount,
      cartTotal,
      isSubmittingOrder,

      // actions
      setSelectedCoolerId,
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

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

// Hook your pages/components use
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside AppContextProvider");
  }
  return ctx;
}
