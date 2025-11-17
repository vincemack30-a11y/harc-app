// src/components/Layout.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ children, brandColor = "#FF7A00" }) {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/coolers", label: "Coolers" },
    { to: "/cart", label: "Cart" },
    { to: "/survey", label: "Survey" },
    { to: "/help", label: "Help" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f5f5" }}>
      <header
        className="px-4 py-3 shadow-md flex items-center justify-between"
        style={{ backgroundColor: brandColor, color: "#ffffff" }}
      >
        <h1 className="text-lg font-semibold">HaRC Healthy Coolers</h1>
        <nav className="flex gap-3 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                "px-2 py-1 rounded-md" +
                (location.pathname === item.to
                  ? " bg-white text-black"
                  : " bg-black/10")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4">{children}</main>

      <footer className="text-xs text-center text-gray-500 py-3">
        Powered by Authority Health · HaRC
      </footer>
    </div>
  );
}

export default Layout;
