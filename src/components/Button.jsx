import { ORANGE } from "../data.js";

export default function Button({ children, onClick, kind = "primary", disabled, style }) {
  const base = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid transparent",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
  const kinds = {
    primary: { background: ORANGE, color: "white" },
    ghost: { background: "transparent", color: ORANGE, border: `1px solid ${ORANGE}` },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...kinds[kind], ...style }}>
      {children}
    </button>
  );
}
