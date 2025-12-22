// src/AppContext.jsx
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Main shared state for the app
  const [selectedCooler, setSelectedCooler] = useState(null);
  const [orderMeta, setOrderMeta] = useState(null);

  // You can add more shared fields here later if needed
  const value = {
    // new names
    selectedCooler,
    setSelectedCooler,
    orderMeta,
    setOrderMeta,

    // backwards-compatible aliases in case older code uses these
    coolerId: selectedCooler,
    setCoolerId: setSelectedCooler,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside an AppProvider");
  }
  return ctx;
}

// keep a default export so old imports like `import AppContext from "./AppContext"`
 // still work
export default AppContext;
