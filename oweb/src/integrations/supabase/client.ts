import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env
    ?.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined) ||
  (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined);

const SUPABASE_PUBLISHABLE_KEY =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env
    ?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== "undefined"
    ? process.env.SUPABASE_PUBLISHABLE_KEY
    : undefined) ||
  (typeof process !== "undefined"
    ? process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    : undefined);

// Untyped until `supabase gen types` is wired; schema lives in migrations + types.ts.
function createBrowserClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    // Allow build/typecheck without env; runtime routes check before use.
    return createClient("https://placeholder.supabase.co", "placeholder-key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  const isBrowser = typeof window !== "undefined";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      storage: isBrowser ? window.localStorage : undefined,
      storageKey: "taskosaur-oweb-auth",
    },
  });
}

export const supabase: SupabaseClient = createBrowserClient();

export function hasSupabaseBrowserConfig(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}
