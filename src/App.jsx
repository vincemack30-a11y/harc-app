// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";

// Customer screens (in src/pages)
import Home from "./pages/Home";
import Coolers from "./pages/Coolers";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Intake from "./pages/Intake";
import Help from "./pages/Help";

// Staff tools (Staff + Assist live in src/pages)
import Staff from "./pages/Staff";
import Assist from "./pages/Assist";

// Manager dashboard lives at src/ManagerDashboard.jsx
import ManagerDashboard from "./ManagerDashboard";

// Shared / extra screen (root-level)
import Confirmation from "./Confirmation";

function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer-facing flow */}
          <Route path="/" element={<Home />} />
          <Route path="/coolers" element={<Coolers />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/confirmation" element={<Confirmation />} />

          {/* Help / intake */}
          <Route path="/intake" element={<Intake />} />
          <Route path="/help" element={<Help />} />

          {/* Staff tools */}
          <Route path="/staff" element={<Staff />} />
          <Route path="/assist" element={<Assist />} />

          {/* Manager dashboard (PIN gate handled inside component) */}
          <Route path="/manager" element={<ManagerDashboard />} />

          {/* Backwards-compatible alias: /manage → /manager */}
          <Route path="/manage" element={<Navigate to="/manager" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}

export default App;
