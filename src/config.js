// src/config.js
// Single source of truth for runtime feature flags.
// Vite exposes env vars that start with VITE_

export const PUBLIC_MODE =
  String(import.meta.env.VITE_PUBLIC_MODE || "").toLowerCase() === "true";

// Optional: if you ever want a separate flag
export const SHOW_MANAGER_BUTTON = !PUBLIC_MODE;
