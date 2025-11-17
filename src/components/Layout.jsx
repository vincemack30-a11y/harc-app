// src/components/Layout.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/coolers", label: "Coolers" },
  { to: "/cart", label: "Cart" },
  { to: "/survey", label: "Survey" },
  { to: "/help", label: "Help" },
];

const DONATE_URL = "https://authorityhealth.org/donate/";
const FB_URL = "https://www.facebook.com/detroitauthorityhealth/";
const IG_URL = "https://www.instagram.com/authority_health/";

function Layout({ children }) {
  const location = useLocation();

  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(to bottom, #ff7a00 0%, #fff6e5 45%, #e6fff2 100%)",
    color: "#0f172a",
  };

  const headerStyle = {
    background: "linear-gradient(90deg, #ff7a00 0%, #ffa94d 50%, #22c55e 100%)",
    boxShadow: "0 2px 6px rgba(15,23,42,0.15)",
  };

  const headerInnerStyle = {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  };

  const titleBlockStyle = {
    display: "flex",
    flexDirection: "column",
  };

  const subtitleStyle = {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(0,0,0,0.7)",
  };

  const taglineStyle = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    textShadow: "0 1px 2px rgba(0,0,0,0.25)",
  };

  const headerRightText = {
    textAlign: "right",
    fontSize: "10px",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.3,
  };

  const navBarStyle = {
    borderTop: "1px solid rgba(255,255,255,0.25)",
  };

  const navInnerStyle = {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "6px 16px 8px 16px",
    whiteSpace: "nowrap",
    overflowX: "auto",
  };

  const navItemStyle = (active) => ({
    display: "inline-block",
    padding: "4px 11px",
    borderRadius: "9999px",
    marginRight: "8px",
    fontSize: "13px",
    textDecoration: "none",
    backgroundColor: active ? "#ffffff" : "rgba(0,0,0,0.18)",
    color: active ? "#0f172a" : "#ffffff",
    boxShadow: active ? "0 1px 3px rgba(15,23,42,0.15)" : "none",
  });

  const mainWrapperStyle = {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "20px 16px",
    flex: 1,
    width: "100%",
  };

  const cardStyle = {
    backgroundColor: "rgba(255,246,229,0.95)",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
    border: "1px solid #fed7aa",
  };

  const footerStyle = {
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "rgba(248,250,252,0.9)",
  };

  const footerInnerStyle = {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "10px 16px 12px 16px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    fontSize: "11px",
    color: "#64748b",
  };

  const chipRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "6px",
  };

  const chipLabelStyle = {
    marginRight: "4px",
  };

  const chipStyle = {
    padding: "4px 10px",
    borderRadius: "9999px",
    border: "1px solid #cbd5f5",
    backgroundColor: "#ffffff",
    fontSize: "11px",
    fontWeight: 600,
    color: "#334155",
    textDecoration: "none",
  };

  const donateChipStyle = {
    ...chipStyle,
    backgroundColor: "#f97316",
    border: "none",
    color: "#ffffff",
    boxShadow: "0 2px 5px rgba(249,115,22,0.4)",
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={titleBlockStyle}>
            <span style={subtitleStyle}>HaRC Healthy Coolers</span>
            <span style={taglineStyle}>
              Healthy grab-and-go in Detroit neighborhoods.
            </span>
          </div>
          <div style={headerRightText}>
            <div style={{ fontWeight: 600 }}>Authority Health</div>
            <div>Healthy &amp; Resilient Communities (HaRC)</div>
          </div>
        </div>

        {/* Nav */}
        <div style={navBarStyle}>
          <div style={navInnerStyle}>
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={navItemStyle(active)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={mainWrapperStyle}>
        <div style={cardStyle}>{children}</div>
      </main>

      {/* Footer with spaced chips */}
      <footer style={footerStyle}>
        <div style={footerInnerStyle}>
          <span>© {new Date().getFullYear()} Authority Health · HaRC</span>

          <div style={chipRowStyle}>
            <span style={chipLabelStyle}>Stay connected:</span>
            <a href={FB_URL} target="_blank" rel="noreferrer" style={chipStyle}>
              Facebook
            </a>
            <a href={IG_URL} target="_blank" rel="noreferrer" style={chipStyle}>
              Instagram
            </a>
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noreferrer"
              style={donateChipStyle}
            >
              Donate
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
