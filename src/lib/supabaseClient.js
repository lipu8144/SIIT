/**
 * SIIT — Supabase client (singleton)
 * ──────────────────────────────────
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect.
 * When both are present, isSupabaseConfigured = true and every service
 * file uses real DB queries instead of in-memory dummy data.
 */
import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL  || "";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : /** dummy stub so imports don't explode in dummy mode */
    {
      from: () => ({
        select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null }) }), order: () => ({ data: [], error: null }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
        upsert: () => ({ select: () => ({ data: [], error: null }) }),
      }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signOut: async () => {},
        signInWithOAuth: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      },
      storage: { from: () => ({ upload: async () => ({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
    };
