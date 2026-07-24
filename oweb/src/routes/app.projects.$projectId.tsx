import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createTask, getProjectBoard, moveTask } from "@/lib/pm";

export const Route = createFileRoute("/app/projects/$projectId")({
  loader: async ({ params }) =>
    getProjectBoard({ data: { projectId: params.projectId } }),
  component: ProjectBoardPage,
});

function ProjectBoardPage() {
  const initial = Route.useLoaderData();
  const params = Route.useParams();
  const [board, setBoard] = useState(initial);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const columns = useMemo(() => {
    return board.statuses.map((status) => ({
      status,
      tasks: board.tasks.filter((task) => task.status_id === status.id),
    }));
  }, [board]);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const task = await createTask({
        data: {
          projectId: params.projectId,
          title: title.trim(),
        },
      });
      setBoard((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    } finally {
      setBusy(false);
    }
  }

  async function onMove(taskId: string, statusId: string) {
    try {
      const task = await moveTask({ data: { taskId, statusId } });
      setBoard((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move task");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--ts-forest)] uppercase">
            Project
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold">
            {board.project.name}
          </h1>
        </div>
        <form onSubmit={(e) => void onCreate(e)} className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task title"
            className="w-56 rounded-md border border-[var(--ts-moss)]/20 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[var(--ts-forest)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add
          </button>
        </form>
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {columns.map(({ status, tasks }, index) => (
          <section
            key={status.id}
            className="animate-rise surface rounded-xl p-4"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wide uppercase">
                {status.name}
              </h2>
              <span className="text-xs text-[var(--ts-ink)]/50">
                {tasks.length}
              </span>
            </header>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-lg border border-[var(--ts-moss)]/10 bg-white/80 px-3 py-3"
                >
                  <p className="text-sm font-semibold">
                    <span className="text-[var(--ts-forest)]">
                      #{task.task_number}
                    </span>{" "}
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ts-ink)]/55">
                    {task.priority}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {board.statuses
                      .filter((s) => s.id !== task.status_id)
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => void onMove(task.id, s.id)}
                          className="rounded border border-[var(--ts-moss)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ts-moss)]"
                        >
                          → {s.name}
                        </button>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
