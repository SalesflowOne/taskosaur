import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { bootstrapWorkspace, listDashboard } from "@/lib/pm";

export const Route = createFileRoute("/app/")({
  loader: async () => listDashboard(),
  component: DashboardPage,
});

function DashboardPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [orgName, setOrgName] = useState("Acme");
  const [workspaceName, setWorkspaceName] = useState("Product");
  const [projectName, setProjectName] = useState("Launch");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onBootstrap(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await bootstrapWorkspace({
        data: {
          organizationName: orgName,
          workspaceName,
          projectName,
        },
      });
      await router.invalidate();
      if (result.project?.id) {
        await router.navigate({
          to: "/app/projects/$projectId",
          params: { projectId: result.project.id },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bootstrap");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="animate-rise">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-[color-mix(in_oklab,var(--ts-ink)_72%,transparent)]">
          Organizations, workspaces, and projects from Supabase — no Nest API.
        </p>
      </div>

      {data.projects.length === 0 ? (
        <form
          onSubmit={(e) => void onBootstrap(e)}
          className="surface animate-rise mt-10 max-w-xl space-y-4 rounded-xl p-6"
        >
          <h2 className="font-display text-2xl font-bold">Start your workspace</h2>
          <p className="text-sm text-[var(--ts-ink)]/70">
            Creates an organization, default workflow (To Do / In Progress / Done),
            workspace, and first project.
          </p>
          <label className="block text-sm font-semibold">
            Organization
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Workspace
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Project
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[var(--ts-forest)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create workspace"}
          </button>
        </form>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section className="animate-rise">
            <h2 className="text-sm font-semibold tracking-[0.14em] text-[var(--ts-forest)] uppercase">
              Organizations
            </h2>
            <ul className="mt-3 space-y-2">
              {data.organizations.map((org) => (
                <li key={org.id} className="surface rounded-lg px-4 py-3">
                  <p className="font-semibold">{org.name}</p>
                  <p className="text-xs text-[var(--ts-ink)]/55">
                    {org.slug} · {org.role}
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <section className="animate-rise" style={{ animationDelay: "80ms" }}>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-[var(--ts-forest)] uppercase">
              Projects
            </h2>
            <ul className="mt-3 space-y-2">
              {data.projects.map((project) => (
                <li key={project.id}>
                  <Link
                    to="/app/projects/$projectId"
                    params={{ projectId: project.id }}
                    className="surface block rounded-lg px-4 py-3 transition hover:border-[var(--ts-forest)]/40"
                  >
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-xs text-[var(--ts-ink)]/55">
                      {project.status}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
