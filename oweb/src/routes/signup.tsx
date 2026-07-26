import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, hasSupabaseBrowserConfig } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!hasSupabaseBrowserConfig()) {
      setError("Supabase env vars are not configured yet.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      setInfo(
        "Account created. Check your email to confirm, then sign in.",
      );
      return;
    }
    void navigate({ to: "/app" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="font-display text-2xl font-bold text-[var(--ts-moss)]">
        Taskosaur
      </Link>
      <h1 className="font-display mt-8 text-4xl font-bold">Create account</h1>
      <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--ts-ink)_70%,transparent)]">
        Supabase Auth — no Nest JWT stack.
      </p>
      <form onSubmit={onSubmit} className="surface mt-8 space-y-4 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold">
            First name
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Last name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2"
            />
          </label>
        </div>
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
        {info ? <p className="text-sm text-[var(--ts-forest)]">{info}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--ts-forest)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[var(--ts-forest)]">
          Sign in
        </Link>
      </p>
    </main>
  );
}
