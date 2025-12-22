// src/AppShell.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isManagerRoute = location.pathname.startsWith("/manager");
  const isDeliveryRoute = location.pathname.startsWith("/delivery");

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-emerald-100 text-slate-900">
      {/* Top header bar */}
      <header className="border-b border-orange-200/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleHomeClick}
            className="text-left"
          >
            <p className="text-[10px] uppercase tracking-[0.28em] text-orange-500">
              HaRC Healthy Coolers
            </p>
            <p className="text-sm font-semibold leading-tight">
              Grab &amp; go · Better choices · Detroit
            </p>
          </button>

          <nav className="flex items-center gap-3 text-[11px]">
            <Link
              to="/delivery"
              className={`px-3 py-1 rounded-full border transition ${
                isDeliveryRoute
                  ? "bg-orange-500 text-black border-orange-500"
                  : "bg-white/80 text-orange-700 border-orange-300 hover:bg-orange-50"
              }`}
            >
              Delivery beta
            </Link>

            <Link
              to="/manager"
              className={`px-3 py-1 rounded-full border transition ${
                isManagerRoute
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white/80 text-slate-700 border-slate-400 hover:bg-slate-50"
              }`}
            >
              Manager Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className="mx-auto max-w-4xl px-0 sm:px-4 py-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-4xl px-4 py-3 text-[11px] text-slate-500">
        HaRC · Authority Health · Detroit Wayne County · Powered by Byte +
        community partners
      </footer>
    </div>
  );
};

export default AppShell;
