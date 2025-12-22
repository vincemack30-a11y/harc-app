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

// If env vars are missing, do NOT hard-crash the whole app at import-time.
// Instead, return a stub that throws a clear error when used.
const makeStub = () => {
  const err = new Error(
    "Supabase is not configured. Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (check Vercel env + redeploy)."
  );

  return new Proxy(
    {},
    {
      get() {
        return () => {
          throw err;
        };
      },
    }
  );
};

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : makeStub();

// Optional: helpful signal in production logs
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error("[HaRC] Missing Supabase env vars (production).", {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
  });
}
