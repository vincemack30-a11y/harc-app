import { useState } from "react";
import { ORANGE } from "../data.js";

export default function Button({ children, onClick, kind = "primary", disabled, style }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const base = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid transparent",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "transform 120ms ease, box-shadow 120ms ease, background 120ms ease, color 120ms ease",
    transform: active ? "translateY(1px)" : "translateY(0)",
    boxShadow: hover ? "0 6px 18px rgba(0,0,0,0.10)" : "0 3px 10px rgba(0,0,0,0.06)",
  };

  const kinds = {
    primary: {
      background: ORANGE,
      color: "white",
      filter: hover ? "brightness(0.96)" : "none",
    },
    ghost: {
      background: hover ? "rgba(255,106,0,0.06)" : "transparent",
      color: ORANGE,
      border: `1px solid ${ORANGE}`,
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{ ...base, ...kinds[kind], ...style }}
    >
      {children}
    </button>
  );
}
