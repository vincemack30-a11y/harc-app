// api/intake.js
// Vercel Serverless Function
// Handles intake requests for Manager Analytics + Help/Intake flows.
//
// ENV REQUIRED (Vercel Project Settings → Environment Variables):
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
//
// This file runs on the server (safe to use service role key here).

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

function send(res, status, payload) {
  res.status(status).json(payload);
}

function badEnv(res) {
  return send(res, 500, {
    ok: false,
    error: "Server env missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  });
}

export default async function handler(req, res) {
  if (!supabase) return badEnv(res);

  // Basic hardening
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    // GET /api/intake  -> list
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("intake_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        return send(res, 500, { ok: false, error: error.message });
      }

      return send(res, 200, { ok: true, data: data || [] });
    }

    // POST /api/intake -> create
    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;

      // Minimal validation (keep flexible)
      const payload = {
        cooler_id: body?.cooler_id ?? body?.coolerId ?? null,
        name: body?.name ?? null,
        phone: body?.phone ?? null,
        email: body?.email ?? null,
        notes: body?.notes ?? body?.comment ?? null,
        // allow any extra fields without breaking
        meta: body?.meta ?? null,
        status: body?.status ?? null,
      };

      const { data, error } = await supabase
        .from("intake_requests")
        .insert([payload])
        .select("*")
        .single();

      if (error) {
        return send(res, 500, { ok: false, error: error.message });
      }

      return send(res, 200, { ok: true, data });
    }

    // Unsupported
    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { ok: false, error: "Method Not Allowed" });
  } catch (err) {
    return send(res, 500, {
      ok: false,
      error: err?.message || "Server error",
    });
  }
}
