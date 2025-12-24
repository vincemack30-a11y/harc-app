// src/intake.js
// Intake helper that ALWAYS routes through src/api.js
// so localhost uses localStorage, and production uses /api/intake.

import { createIntakeRequest } from "./api";

/**
 * Submit an intake request.
 * Keeps your existing signature, but routes through the unified API layer.
 *
 * Fields your table expects (based on your comment):
 * - cooler_id (text)
 * - phone (text)
 * - notes (text)
 * - needs_primary_care (boolean)
 * - source (text)
 */
export async function submitIntakeRequest({
  coolerId,
  phone,
  notes,
  needsPrimaryCare,
}) {
  const payload = {
    cooler_id: coolerId || null,
    phone: phone || null,
    notes: notes || null,
    needs_primary_care: Boolean(needsPrimaryCare),
    source: "harc-app",
  };

  const result = await createIntakeRequest(payload);

  // Preserve your old behavior: throw on failure so UI can show error state
  if (!result?.ok) {
    const msg = result?.error || "Intake request failed";
    console.error("[HaRC] Intake submit error:", msg);
    throw new Error(msg);
  }

  return result.data;
}
