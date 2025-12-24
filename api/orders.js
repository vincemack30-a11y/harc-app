// api/orders.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;

    // Canonical key name (this is what you're now using in Vercel)
    // Keep the fallbacks so older deployments don't break.
    const SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return res.status(500).json({
        ok: false,
        error:
          "Missing server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("orders")
        .select("id, cooler_id, total, items, created_at, note, source")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      if (!body.cooler_id || !Array.isArray(body.items)) {
        return res.status(400).json({
          ok: false,
          error: "Missing cooler_id or items",
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

      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(201).json({ ok: true, data });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
