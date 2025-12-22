// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

/**
 * Vite exposes env vars ONLY via import.meta.env on the client.
 * These must exist in Vercel as:
 *  - VITE_SUPABASE_URL
 *  - VITE_SUPABASE_ANON_KEY
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Build a non-fatal stub so the app never "white screens" on prod load.
// Any Supabase call will throw a clear error instead of crashing at import-time.
const supabaseStub = {
  _isStub: true,
  from() {
    throw new Error(
      "Supabase is not configured. Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in production."
    );
  },
  rpc() {
    throw new Error(
      "Supabase is not configured. Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in production."
    );
  },
  auth: {
    signInWithPassword() {
      throw new Error(
        "Supabase is not configured. Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in production."
      );
    },
    signOut() {
      throw new Error(
        "Supabase is not configured. Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in production."
      );
    },
    getSession() {
      throw new Error(
        "Supabase is not configured. Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in production."
      );
    },
  },
};

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : supabaseStub;

// Optional: helpful signal in production logs
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[HaRC] Missing Supabase env vars:", {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
  });
}
