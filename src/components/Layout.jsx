import { Link } from "react-router-dom";
import { BG, ORANGE } from "../data.js";
import { useCart } from "../context/CartContext.jsx";

export default function Layout({ children }) {
  const { cart } = useCart();
  const count = cart.reduce((n, l) => n + l.qty, 0);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: ORANGE, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: BG, padding: "14px 0", borderBottom: "1px solid #f2e6d9" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: 18, color: ORANGE, textDecoration: "none" }}>HaRC</Link>
          <nav style={{ display: "flex", gap: 10 }}>
            <NavLink to="/">Coolers</NavLink>
            <NavLink to="/cart">Cart ({count})</NavLink>
            <NavLink to="/help">Help</NavLink>
          </nav>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 80px" }}>{children}</div>
    </div>
  );
}

function NavLink({ to, children }) {
  return <Link to={to} style={{ color: ORANGE, textDecoration: "none", fontWeight: 700 }}>{children}</Link>;
}
