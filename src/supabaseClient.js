// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Vite env vars must be prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIG_OK = Boolean(supabaseUrl && supabaseAnonKey);

// IMPORTANT:
// - Do NOT hard-throw here. If Production env vars are missing, we want the UI to render a helpful message.
export const supabase = SUPABASE_CONFIG_OK ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!SUPABASE_CONFIG_OK) {
  // This will show up in the browser console (including Vercel production)
  console.error(
    "[HaRC] Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel (Production) and .env.local (dev)."
  );
}
