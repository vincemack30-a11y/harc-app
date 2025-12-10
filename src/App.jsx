// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./Home.jsx";
import CoolerScreen from "./pages/Coolers.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Survey from "./Survey.jsx";        // existing Survey.jsx at src root
import Assist from "./pages/assist.jsx";  // file is lowercase "assist.jsx"
import Confirmation from "./Confirmation.jsx";
import ManagerDashboard from "./ManagerDashboard.jsx";

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-100">
      {/* Top bar */}
      <header className="w-full border-b border-orange-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-400 to-emerald-400 flex items-center justify-center text-xs font-bold text-white shadow">
              HaRC
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                HaRC Healthy Coolers
              </p>
              <p className="text-[11px] text-slate-500">
                Grab &amp; go • Better choices • Detroit
              </p>
            </div>
          </Link>

          {/* Right side links */}
          <nav className="flex items-center gap-3 text-xs">
            <Link
              to="/assist"
              className="hidden sm:inline-block text-slate-600 hover:text-slate-900"
            >
              Need help?
            </Link>
            <Link
              to="/manager"
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-50 bg-white"
            >
              Manager Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Content area */}
      <main className="max-w-4xl mx-auto px-4 py-4">{children}</main>

      {/* Footer */}
      <footer className="mt-8 pb-4">
        <div className="max-w-4xl mx-auto px-4 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>HaRC • Authority Health • Detroit Wayne County</span>
          <span>Powered by Byte + community partners</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public customer flows inside the shell */}
        <Route
          path="/"
          element={
            <AppShell>
              <Home />
            </AppShell>
          }
        />

        {/* Cooler selection / details */}
        <Route
          path="/coolers/:coolerId"
          element={
            <AppShell>
              <CoolerScreen />
            </AppShell>
          }
        />
        {/* Backwards-compatible alias */}
        <Route
          path="/cooler/:coolerId"
          element={
            <AppShell>
              <CoolerScreen />
            </AppShell>
          }
        />

        {/* Menu – support both /menu and /menu/:coolerId */}
        <Route
          path="/menu"
          element={
            <AppShell>
              <Menu />
            </AppShell>
          }
        />
        <Route
          path="/menu/:coolerId"
          element={
            <AppShell>
              <Menu />
            </AppShell>
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <AppShell>
              <Cart />
            </AppShell>
          }
        />

        {/* Survey */}
        <Route
          path="/survey"
          element={
            <AppShell>
              <Survey />
            </AppShell>
          }
        />

        {/* Help / Assist */}
        <Route
          path="/assist"
          element={
            <AppShell>
              <Assist />
            </AppShell>
          }
        />

        {/* Order confirmation – support BOTH paths */}
        <Route
          path="/confirmation"
          element={
            <AppShell>
              <Confirmation />
            </AppShell>
          }
        />
        <Route
          path="/confirmed"
          element={
            <AppShell>
              <Confirmation />
            </AppShell>
          }
        />

        {/* Manager dashboard stands alone with its own layout */}
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
