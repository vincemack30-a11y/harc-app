// src/context/AppContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

// App-wide state: active cooler, basic user/session flags, etc.
// Keep this minimal + stable so pages can rely on it.
const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Active cooler selection (used by Coolers/Menu/Confirm flows)
  const [activeCoolerId, setActiveCoolerId] = useState(null);

  // Optional: track a lightweight "mock user" for demo purposes
  const [user, setUser] = useState({
    name: "Guest",
    role: "customer",
  });

  // Optional: manager unlocked flag (PIN flow may set this elsewhere too)
  const [managerUnlocked, setManagerUnlocked] = useState(false);

  const value = useMemo(
    () => ({
      activeCoolerId,
      setActiveCoolerId,
      user,
      setUser,
      managerUnlocked,
      setManagerUnlocked,
    }),
    [activeCoolerId, user, managerUnlocked]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}

export { AppContext };
