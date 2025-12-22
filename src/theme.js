// src/theme.js
export function applyTheme() {
  const root = document.documentElement;

  // Brighter orange background (brand feel) — not just buttons
  root.style.setProperty(
    "--harc-bg",
    "linear-gradient(135deg, #FFB25C 0%, #FFF1D8 42%, #D9FBEA 100%)"
  );

  // Core surfaces
  root.style.setProperty("--harc-card", "#FFFFFF");
  root.style.setProperty("--harc-text", "#1F2937");
  root.style.setProperty("--harc-muted", "#6B7280");
  root.style.setProperty("--harc-border", "#FED7AA");

  // Brand colors (orange/green)
  root.style.setProperty("--harc-orange", "#F97316");
  root.style.setProperty("--harc-green", "#16A34A");

  // Soft green accents
  root.style.setProperty("--harc-soft-green-bg", "#ECFDF5");
  root.style.setProperty("--harc-soft-green-border", "#A7F3D0");

  // Danger styling (analytics note box)
  root.style.setProperty("--harc-danger-bg", "#FEF2F2");
  root.style.setProperty("--harc-danger-border", "#FECACA");
  root.style.setProperty("--harc-danger-text", "#991B1B");
}
