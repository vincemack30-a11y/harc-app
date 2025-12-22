// src/coolerIdMap.js
// Canonical cooler_id normalization + legacy support.
// Canonical IDs come from src/data.js COOLERS (popoff, hope, partner_1).

import { COOLERS } from "./data";

// Build legacy map: "cooler_1" -> COOLERS[id=1].cooler_id ("popoff"), etc.
const LEGACY_TO_CANONICAL = COOLERS.reduce((acc, c) => {
  if (c?.id && c?.cooler_id) acc[`cooler_${c.id}`] = c.cooler_id;
  return acc;
}, {});

// Build lookup by canonical id
const CANONICAL_SET = new Set(COOLERS.map((c) => c.cooler_id).filter(Boolean));

// Normalize text
export function norm(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' _-]/g, "");
}

/**
 * normalizeCoolerId(anyIdOrText) -> canonical cooler_id or null
 *
 * Accepts:
 * - "popoff" / "hope" / "partner_1" (canonical) => returns itself
 * - "cooler_1" / "cooler_2" (legacy) => returns mapped canonical
 * - Any text containing cooler name/address keywords => best-effort match
 */
export function normalizeCoolerId(anyIdOrText) {
  const raw = norm(anyIdOrText);
  if (!raw) return null;

  // 1) If it is already canonical
  if (CANONICAL_SET.has(raw)) return raw;

  // 2) If it is legacy cooler_#
  if (LEGACY_TO_CANONICAL[raw]) return LEGACY_TO_CANONICAL[raw];

  // 3) Best-effort: match by name/address keywords
  // (useful if some old rows stored name/address instead of cooler_id)
  for (const c of COOLERS) {
    const candidates = [
      c.cooler_id,
      c.name,
      c.address,
      c.notes,
    ]
      .map(norm)
      .filter(Boolean);

    if (candidates.some((x) => x && raw.includes(x))) return c.cooler_id;
  }

  return null;
}

export function getCanonicalCoolerIdFromSelectedCooler(selectedCooler) {
  if (!selectedCooler) return null;

  // Try common fields first
  const direct =
    selectedCooler.cooler_id ||
    selectedCooler.id ||
    selectedCooler.slug ||
    selectedCooler.name ||
    selectedCooler.address;

  return normalizeCoolerId(direct);
}

// Export for debugging
export const COOLER_CANONICAL_IDS = [...CANONICAL_SET];
export const LEGACY_COOLER_ID_MAP = { ...LEGACY_TO_CANONICAL };
