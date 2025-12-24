// api/intake.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;

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
        .from("intake_requests")
        .select("id, cooler_id, name, phone, email, need, created_at, status, source")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === "POST") {
      const body = req.body || {};

      // Keep validation light but safe
      if (!body.need) {
        return res.status(400).json({ ok: false, error: "Missing need" });
      }

      const payload = {
        cooler_id: body.cooler_id ? String(body.cooler_id) : null,
        name: body.name ? String(body.name) : null,
        phone: body.phone ? String(body.phone) : null,
        email: body.email ? String(body.email) : null,
        need: String(body.need),
        status: body.status ? String(body.status) : "new",
        source: body.source ? String(body.source) : "harc-app",
      };

      const { data, error } = await supabase
        .from("intake_requests")
        .insert([payload])
        .select("id, cooler_id, name, phone, email, need, created_at, status, source")
        .single();

      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(201).json({ ok: true, data });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
