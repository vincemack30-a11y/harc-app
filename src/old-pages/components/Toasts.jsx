import { ORANGE } from "../data.js";
import { useCart } from "../context/CartContext.jsx";

export default function Toasts() {
  const { toasts } = useCart();
  return (
    <div style={{
      position: "fixed",
      right: 16,
      top: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      zIndex: 40,
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: "white",
          color: ORANGE,
          border: `1px solid ${ORANGE}`,
          padding: "10px 12px",
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          fontWeight: 700,
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
