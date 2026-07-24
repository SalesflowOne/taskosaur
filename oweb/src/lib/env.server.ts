function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[name];
}

export function getSupabaseUrl(): string {
  const value =
    readEnv("SUPABASE_URL") ||
    readEnv("VITE_SUPABASE_URL") ||
    "";
  if (!value) throw new Error("Missing SUPABASE_URL / VITE_SUPABASE_URL");
  return value;
}

export function getSupabasePublishableKey(): string {
  const value =
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    "";
  if (!value) {
    throw new Error(
      "Missing SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  return value;
}

export function getSupabaseServiceRoleKey(): string {
  const value =
    readEnv("SUPABASE_SERVICE_ROLE_KEY") || readEnv("SERVICE_ROLE_KEY") || "";
  if (!value) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return value;
}

export function hasSupabaseServiceRoleKey(): boolean {
  return Boolean(
    readEnv("SUPABASE_SERVICE_ROLE_KEY") || readEnv("SERVICE_ROLE_KEY"),
  );
}

export function getAppUrl(): string {
  return (
    readEnv("APP_URL") ||
    readEnv("VITE_APP_URL") ||
    readEnv("VERCEL_URL")?.replace(/^/, "https://") ||
    "http://localhost:3001"
  );
}

export function getCronSecret(): string | undefined {
  return readEnv("CRON_SECRET");
}
