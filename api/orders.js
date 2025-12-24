// api/orders.js
import { createClient } from "@supabase/supabase-js";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return json(res, 500, {
      ok: false,
      error:
        "Server misconfigured: missing SUPABASE_URL and/or service role key env var in Vercel.",
      missing: {
        SUPABASE_URL: !SUPABASE_URL,
        SERVICE_KEY: !SERVICE_KEY,
      },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
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

      if (!body.cooler_id || !Array.isArray(body.items) || body.items.length === 0) {
        return json(res, 400, {
          ok: false,
          error: "Missing cooler_id or items.",
        });
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
