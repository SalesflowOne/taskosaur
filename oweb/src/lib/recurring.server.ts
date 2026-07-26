import { getSupabaseAdminOrNull } from "@/integrations/supabase/client.server";
import { taskSlug } from "@/lib/slug";

/** Cron: spawn next occurrence for due recurring tasks (admin). */
export async function processRecurringTasks(): Promise<{
  spawned: number;
  skipped?: string;
}> {
  const admin = getSupabaseAdminOrNull();
  if (!admin) {
    return {
      spawned: 0,
      skipped: "SUPABASE_SERVICE_ROLE_KEY is not configured",
    };
  }

  const { data: due, error } = await admin
    .from("recurring_tasks")
    .select("*, tasks(*)")
    .eq("is_active", true)
    .lte("next_occurrence", new Date().toISOString())
    .limit(50);

  if (error) throw new Error(error.message);
  let spawned = 0;

  for (const row of due ?? []) {
    const source = row.tasks as {
      id: string;
      project_id: string;
      status_id: string;
      title: string;
      description: string | null;
      priority: string;
      type: string;
    } | null;
    if (!source) continue;

    const { data: last } = await admin
      .from("tasks")
      .select("task_number")
      .eq("project_id", source.project_id)
      .order("task_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const taskNumber = (last?.task_number ?? 0) + 1;
    const { error: insertErr } = await admin.from("tasks").insert({
      project_id: source.project_id,
      status_id: source.status_id,
      title: source.title,
      description: source.description,
      priority: source.priority as "MEDIUM",
      type: source.type as "TASK",
      task_number: taskNumber,
      slug: taskSlug(taskNumber, source.title),
    });
    if (insertErr) continue;

    const next = new Date(row.next_occurrence);
    if (row.recurrence_type === "DAILY") {
      next.setUTCDate(next.getUTCDate() + row.interval);
    } else if (row.recurrence_type === "WEEKLY") {
      next.setUTCDate(next.getUTCDate() + 7 * row.interval);
    } else if (row.recurrence_type === "MONTHLY") {
      next.setUTCMonth(next.getUTCMonth() + row.interval);
    } else {
      next.setUTCFullYear(next.getUTCFullYear() + row.interval);
    }

    await admin
      .from("recurring_tasks")
      .update({
        next_occurrence: next.toISOString(),
        current_occurrence: row.current_occurrence + 1,
      })
      .eq("id", row.id);

    spawned += 1;
  }

  return { spawned };
}
