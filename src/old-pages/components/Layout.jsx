import { Link, useLocation, useNavigate } from "react-router-dom";
import { BG, ORANGE } from "../data.js";
import { useCart } from "../context/CartContext.jsx";

export default function Layout({ children }) {
  const { cart, total } = useCart();
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const { pathname } = useLocation();
  const nav = useNavigate();

  const hideFooter =
    pathname.startsWith("/cart") ||
    pathname.startsWith("/confirm") ||
    pathname.startsWith("/survey") ||
    pathname.startsWith("/help");

  return (
    <div style={{ minHeight: "100vh", background: BG, color: ORANGE, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: BG, padding: "14px 0", borderBottom: "1px solid #f2e6d9" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: 18, color: ORANGE, textDecoration: "none" }}>HaRC</Link>
          <nav style={{ display: "flex", gap: 14 }}>
            <NavLink to="/" label="Coolers" />
            <NavLink to="/cart" label={`Cart (${count})`} />
            <NavLink to="/help" label="Help" />
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 80px" }}>{children}</div>

      {/* Sticky footer CTA */}
      {count > 0 && !hideFooter && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            background: "white",
            borderTop: "1px solid #f2e6d9",
            boxShadow: "0 -8px 18px rgba(0,0,0,0.06)",
            padding: "12px 16px",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>
              {count} item{count > 1 ? "s" : ""} • ${total.toFixed(2)}
            </div>
            <button
              onClick={() => nav("/cart")}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid transparent",
                background: ORANGE,
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              View Cart / Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ to, label }) {
  const { pathname } = useLocation();
  const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      style={{
        color: ORANGE,
        textDecoration: "none",
        fontWeight: 700,
        padding: "6px 8px",
        borderRadius: 10,
        background: isActive ? "rgba(255,106,0,0.10)" : "transparent",
        border: isActive ? `1px solid ${ORANGE}` : "1px solid transparent",
      }}
    >
      {label}
    </Link>
  );
}
