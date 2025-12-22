// src/backfillCoolerIds.js
import { supabase } from "./supabaseClient";
import { normalizeCoolerId } from "./coolerIdMap";

/**
 * Backfill cooler_id in these tables (based on your DB):
 * - orders: cooler_id (text)
 * - intake_requests: cooler_id (text)
 *
 * delivery_orders has NO cooler_id in your screenshots, so we do not touch it.
 */

async function fetchBatch(table, limit = 1000, offset = 0) {
  // Pull rows where cooler_id is NULL or starts with "cooler_"
  // (Supabase JS doesn't support OR easily with query builder, so we do two pulls.)
  const [nullRes, legacyRes] = await Promise.all([
    supabase
      .from(table)
      .select("id, cooler_id, created_at")
      .is("cooler_id", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),

    supabase
      .from(table)
      .select("id, cooler_id, created_at")
      .like("cooler_id", "cooler_%")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
  ]);

  if (nullRes.error) throw nullRes.error;
  if (legacyRes.error) throw legacyRes.error;

  // merge and unique by id
  const merged = [...(nullRes.data || []), ...(legacyRes.data || [])];
  const seen = new Set();
  const out = [];
  for (const r of merged) {
    if (!r?.id) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

async function updateRow(table, id, cooler_id) {
  const { error } = await supabase.from(table).update({ cooler_id }).eq("id", id);
  if (error) throw error;
}

async function backfillTable(table, { dryRun = false, pageLimit = 1000, maxPages = 10 } = {}) {
  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for (let page = 0; page < maxPages; page++) {
    const batch = await fetchBatch(table, pageLimit, page * pageLimit);
    if (!batch.length) break;

    for (const row of batch) {
      scanned += 1;

      const canonical = normalizeCoolerId(row.cooler_id);
      if (!canonical) {
        skipped += 1;
        continue;
      }

      // If already canonical, skip
      if (row.cooler_id === canonical) {
        skipped += 1;
        continue;
      }

      if (!dryRun) {
        await updateRow(table, row.id, canonical);
      }
      updated += 1;
    }
  }

  return { table, scanned, updated, skipped, dryRun };
}

/**
 * Run this from anywhere in your app (Manager button, temporary dev button, or console).
 * Example:
 *   import { runBackfill } from "./backfillCoolerIds";
 *   await runBackfill({ dryRun: true });
 */
export async function runBackfill({ dryRun = false } = {}) {
  const results = {};
  results.orders = await backfillTable("orders", { dryRun });
  results.intake_requests = await backfillTable("intake_requests", { dryRun });
  return results;
}
