// src/lib/activeCooler.js
// Single source of truth for cooler selection persistence.

const KEY = "harcActiveCoolerId";

export function getActiveCoolerId() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setActiveCoolerId(coolerId) {
  if (typeof window === "undefined") return;
  try {
    if (!coolerId) {
      window.localStorage.removeItem(KEY);
      return;
    }
    // IMPORTANT: store the stable string ids (popoff/hope/partner_1)
    window.localStorage.setItem(KEY, String(coolerId));
  } catch {
    // ignore
  }
}

export function clearActiveCoolerId() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
