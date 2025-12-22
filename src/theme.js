// src/theme.js
// Central theme tokens. App.jsx relies on these CSS variables.

export function applyTheme() {
  const root = document.documentElement;

  // Brighter orange background (requested)
  // This is a vivid, warm orange-tint that still keeps cards readable.
  root.style.setProperty("--harc-bg", "#FFE2BD");

  // Surfaces
  root.style.setProperty("--harc-card", "#FFFFFF");

  // Text
  root.style.setProperty("--harc-text", "#111827");
  root.style.setProperty("--harc-muted", "#6B7280");

  // Brand
  root.style.setProperty("--harc-orange", "#F97316"); // primary orange
  root.style.setProperty("--harc-green", "#16A34A");  // primary green

  // Borders
  root.style.setProperty("--harc-border", "#FDBA74"); // orange border that matches brighter bg

  // Soft green (used for selected/active pills + cooler selection)
  root.style.setProperty("--harc-soft-green-bg", "#ECFDF5");
  root.style.setProperty("--harc-soft-green-border", "#A7F3D0");

  // Danger (used in analytics note box)
  root.style.setProperty("--harc-danger-bg", "#FEF2F2");
  root.style.setProperty("--harc-danger-border", "#FECACA");
  root.style.setProperty("--harc-danger-text", "#991B1B");
}
