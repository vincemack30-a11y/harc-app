// api/orders.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  // Basic CORS (safe for your use case)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.end();

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json(res, 500, {
      ok: false,
      error: "Server not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).",
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("orders")
        .select("id, cooler_id, total, items, created_at, note, source")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 200, { ok: true, data });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      // Minimum validation
      if (!body.cooler_id || !Array.isArray(body.items)) {
        return json(res, 400, { ok: false, error: "Missing cooler_id or items." });
      }

      const payload = {
        cooler_id: String(body.cooler_id),
        total: Number(body.total || 0),
        items: body.items,
        source: body.source ? String(body.source) : "harc-app",
        note: body.note ? String(body.note) : null,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([payload])
        .select("id, cooler_id, total, items, created_at, note, source")
        .single();

      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 201, { ok: true, data });
    }

    return json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (e) {
    return json(res, 500, { ok: false, error: e?.message || "Server error" });
  }
}
