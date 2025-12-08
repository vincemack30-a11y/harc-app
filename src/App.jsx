import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";

// Customer screens (in src/pages)
import Home from "./pages/Home";
import Coolers from "./pages/Coolers";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Intake from "./pages/Intake";
import Help from "./pages/Help";

// Staff tools (in src/pages)
import Staff from "./pages/Staff";
import Assist from "./pages/Assist";

// Shared / extra screens (root-level)
import Confirmation from "./Confirmation";
import ManagerDashboard from "./ManagerDashboard";

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
          <Route path="/manager" element={<ManagerDashboard />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}

export default App;
