// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// These should be set in your .env.local file:
// VITE_SUPABASE_URL=...
// VITE_SUPABASE_ANON_KEY=...
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or anon key is missing. Check your .env.local file (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 👇 This is the important part: default export
export default supabase;
