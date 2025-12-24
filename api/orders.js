// api/orders.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Never cache API responses (helps during env/deploy debugging)
  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const SUPABASE_URL =
      process.env.SUPABASE_URL ||
      process.env.SUPABASE_PROJECT_URL || // (optional fallback)
      "";

    // Support multiple env var names (so deploys don’t break)
    const SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SERVICE_ROLE ||
      "";

    // SAFE DEBUG: never reveal values, only presence + environment name
    // Visit: /api/orders?debug=1
    if (req.method === "GET" && String(req.query?.debug) === "1") {
      return res.status(200).json({
        ok: true,
        debug: {
          nodeEnv: process.env.NODE_ENV || null,
          vercelEnv: process.env.VERCEL_ENV || null, // production / preview / development
          hasSupabaseUrl: Boolean(SUPABASE_URL),
          hasServiceRoleKey: Boolean(SERVICE_ROLE_KEY),

          // Shows which exact names exist (still no values)
          presentNames: {
            SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
            SUPABASE_PROJECT_URL: Boolean(process.env.SUPABASE_PROJECT_URL),
            SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
            SUPABASE_SERVICE_ROLE: Boolean(process.env.SUPABASE_SERVICE_ROLE),
            SUPABASE_SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY),
            SERVICE_ROLE: Boolean(process.env.SERVICE_ROLE),
          },
        },
      });
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return res.status(500).json({
        ok: false,
        error:
          "Missing server env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
        debug: {
          vercelEnv: process.env.VERCEL_ENV || null,
          hasSupabaseUrl: Boolean(SUPABASE_URL),
          hasServiceRoleKey: Boolean(SERVICE_ROLE_KEY),
        },
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

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }
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

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }
      return res.status(201).json({ ok: true, data });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: e?.message || "Server error" });
  }
}
