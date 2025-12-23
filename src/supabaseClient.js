import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log only — NEVER throw during import
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[HaRC] Missing Supabase env vars", {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
  });
}

// Always export a usable object
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : {
        // Safe no-op client to prevent crashes
        from() {
          return {
            select: async () => ({ data: [], error: null }),
            insert: async () => ({ data: null, error: null }),
            rpc: async () => ({ data: null, error: null }),
          };
        },
        auth: {
          getSession: async () => ({ data: null, error: null }),
        },
      };
