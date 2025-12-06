// src/intake.js
import supabase from "./supabaseClient.js";

/**
 * Submit an intake request to the `intake_requests` table.
 * Matches the table definition:
 *   id uuid (default)
 *   created_at timestamptz (default)
 *   cooler_id text
 *   phone text
 *   notes text
 *   needs_primary_care boolean
 *   source text
 */
export async function submitIntakeRequest({
  coolerId,
  phone,
  notes,
  needsPrimaryCare,
}) {
  const payload = {
    cooler_id: coolerId,
    phone,
    notes,
    needs_primary_care: needsPrimaryCare,
    source: "harc-app",
  };

  const { data, error } = await supabase
    .from("intake_requests")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Intake insert error:", error);
    throw error;
  }

  return data;
}
