import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 md:px-12">
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 60L60 0M30 60L60 30M0 30L30 0%22 stroke=%22%230f766e14%22 stroke-width=%221%22 fill=%22none%22/%3E%3C/svg%3E')]"
      />
      <header className="animate-rise relative z-10 mx-auto flex max-w-6xl items-center justify-between">
        <p className="font-display text-3xl font-bold tracking-tight text-[var(--ts-moss)] md:text-4xl">
          Taskosaur
        </p>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link
            to="/login"
            className="rounded-md px-3 py-2 text-[var(--ts-moss)] transition hover:bg-white/50"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-[var(--ts-forest)] px-4 py-2 text-white shadow-sm transition hover:bg-[var(--ts-moss)]"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="animate-rise relative z-10 mx-auto mt-24 grid max-w-6xl gap-10 md:mt-32 md:grid-cols-[1.1fr_0.9fr] md:items-end">
        <div className="max-w-xl" style={{ animationDelay: "80ms" }}>
          <h1 className="font-display text-5xl leading-[1.05] font-bold tracking-tight text-[var(--ts-ink)] md:text-7xl">
            Project work, fully on Vercel.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[color-mix(in_oklab,var(--ts-ink)_78%,transparent)]">
            Taskosaur is converting to the OWeb stack — TanStack Start, Supabase,
            and Vercel Cron — so you no longer need a Nest server or Redis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-md bg-[var(--ts-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ts-moss)]"
            >
              Create workspace
            </Link>
            <Link
              to="/app"
              className="rounded-md border border-[var(--ts-moss)]/25 bg-white/60 px-5 py-3 text-sm font-semibold text-[var(--ts-moss)]"
            >
              Open app
            </Link>
          </div>
        </div>
        <div
          className="surface animate-rise relative min-h-[280px] rounded-2xl p-6 shadow-[0_20px_60px_-30px_rgba(15,70,60,0.45)]"
          style={{ animationDelay: "160ms" }}
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--ts-forest)] uppercase">
            OWeb runtime
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--ts-ink)]">
            <li>Vercel + Nitro for the whole app process</li>
            <li>Supabase Auth + Postgres with RLS</li>
            <li>Cron for recurring tasks (no BullMQ)</li>
            <li>Legacy Nest stack kept under backend/ for reference</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
