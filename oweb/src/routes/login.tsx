import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, hasSupabaseBrowserConfig } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!hasSupabaseBrowserConfig()) {
      setError("Supabase env vars are not configured yet.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    void navigate({ to: "/app" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="font-display text-2xl font-bold text-[var(--ts-moss)]">
        Taskosaur
      </Link>
      <h1 className="font-display mt-8 text-4xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--ts-ink)_70%,transparent)]">
        Use your Supabase Auth credentials.
      </p>
      <form onSubmit={onSubmit} className="surface mt-8 space-y-4 rounded-xl p-6">
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--ts-forest)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        No account?{" "}
        <Link to="/signup" className="font-semibold text-[var(--ts-forest)]">
          Sign up
        </Link>
      </p>
    </main>
  );
}
