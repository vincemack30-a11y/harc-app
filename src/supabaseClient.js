// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helpful warning if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars."
  );
}

// Create the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Also export default, just in case any old code imports default
export default supabase;
