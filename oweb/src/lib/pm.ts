import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { slugify, taskSlug } from "@/lib/slug";

const DEFAULT_STATUSES = [
  {
    name: "To Do",
    color: "#64748B",
    category: "TODO" as const,
    position: 0,
    is_default: true,
  },
  {
    name: "In Progress",
    color: "#2563EB",
    category: "IN_PROGRESS" as const,
    position: 1,
    is_default: false,
  },
  {
    name: "Done",
    color: "#059669",
    category: "DONE" as const,
    position: 2,
    is_default: false,
  },
];

export const getSessionUser = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const { getAuthedClient } = await import("@/lib/auth.server");
      const { user } = await getAuthedClient();
      return {
        id: user.id,
        email: user.email ?? "",
      };
    } catch {
      return null;
    }
  },
);

export const listDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getAuthedClient } = await import("@/lib/auth.server");
    const { client, user } = await getAuthedClient();

    const { data: memberships, error: memErr } = await client
      .from("organization_members")
      .select("organization_id, role, organizations(id, name, slug)")
      .eq("user_id", user.id);

    if (memErr) throw new Error(memErr.message);

    const orgIds = (memberships ?? []).map((m) => m.organization_id);
    if (orgIds.length === 0) {
      return { organizations: [], workspaces: [], projects: [] };
    }

    const { data: workspaces, error: wsErr } = await client
      .from("workspaces")
      .select("id, name, slug, organization_id, color")
      .in("organization_id", orgIds)
      .eq("archive", false)
      .order("created_at", { ascending: true });

    if (wsErr) throw new Error(wsErr.message);

    const workspaceIds = (workspaces ?? []).map((w) => w.id);
    let projects: Array<{
      id: string;
      name: string;
      slug: string;
      workspace_id: string;
      color: string;
      status: string;
    }> = [];

    if (workspaceIds.length > 0) {
      const { data, error } = await client
        .from("projects")
        .select("id, name, slug, workspace_id, color, status")
        .in("workspace_id", workspaceIds)
        .eq("archive", false)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      projects = data ?? [];
    }

    return {
      organizations: (memberships ?? []).map((m) => {
        const org = m.organizations as
          | { id: string; name: string; slug: string }
          | { id: string; name: string; slug: string }[]
          | null;
        const resolved = Array.isArray(org) ? org[0] : org;
        return {
          id: resolved?.id ?? m.organization_id,
          name: resolved?.name ?? "Organization",
          slug: resolved?.slug ?? "",
          role: m.role,
        };
      }),
      workspaces: workspaces ?? [],
      projects,
    };
  },
);

export const bootstrapWorkspace = createServerFn({ method: "POST" })
  .validator(
    z.object({
      organizationName: z.string().min(2).max(80),
      workspaceName: z.string().min(2).max(80),
      projectName: z.string().min(2).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const { getAuthedClient } = await import("@/lib/auth.server");
    const { client, user } = await getAuthedClient();
    const orgSlug = `${slugify(data.organizationName)}-${user.id.slice(0, 6)}`;
    const wsSlug = slugify(data.workspaceName);
    const projectSlug = slugify(data.projectName);

    const { data: org, error: orgErr } = await client
      .from("organizations")
      .insert({
        name: data.organizationName,
        slug: orgSlug,
        owner_id: user.id,
      })
      .select("id, name, slug")
      .single();
    if (orgErr) throw new Error(orgErr.message);

    const { error: memErr } = await client.from("organization_members").insert({
      organization_id: org.id,
      user_id: user.id,
      role: "OWNER",
      is_default: true,
    });
    if (memErr) throw new Error(memErr.message);

    await client
      .from("profiles")
      .update({ default_organization_id: org.id })
      .eq("id", user.id);

    const { data: workflow, error: wfErr } = await client
      .from("workflows")
      .insert({
        organization_id: org.id,
        name: "Default",
        is_default: true,
        created_by_id: user.id,
      })
      .select("id")
      .single();
    if (wfErr) throw new Error(wfErr.message);

    const { data: statuses, error: stErr } = await client
      .from("task_statuses")
      .insert(
        DEFAULT_STATUSES.map((s) => ({
          ...s,
          workflow_id: workflow.id,
        })),
      )
      .select("id, name, is_default");
    if (stErr) throw new Error(stErr.message);

    const { data: workspace, error: wsErr } = await client
      .from("workspaces")
      .insert({
        organization_id: org.id,
        name: data.workspaceName,
        slug: wsSlug,
        color: "#0F766E",
        created_by_id: user.id,
      })
      .select("id, name, slug")
      .single();
    if (wsErr) throw new Error(wsErr.message);

    await client.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "OWNER",
    });

    const { data: project, error: projErr } = await client
      .from("projects")
      .insert({
        workspace_id: workspace.id,
        workflow_id: workflow.id,
        name: data.projectName,
        slug: projectSlug,
        task_prefix: data.projectName.slice(0, 3).toUpperCase(),
        color: "#0F766E",
        status: "ACTIVE",
        created_by_id: user.id,
      })
      .select("id, name, slug")
      .single();
    if (projErr) throw new Error(projErr.message);

    await client.from("project_members").insert({
      project_id: project.id,
      user_id: user.id,
      role: "OWNER",
    });

    const defaultStatus =
      statuses?.find((s) => s.is_default) ?? statuses?.[0] ?? null;

    return {
      organization: org,
      workspace,
      project,
      defaultStatusId: defaultStatus?.id ?? null,
    };
  });

export const getProjectBoard = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { getAuthedClient } = await import("@/lib/auth.server");
    const { client } = await getAuthedClient();

    const { data: project, error: pErr } = await client
      .from("projects")
      .select("id, name, slug, color, status, workflow_id, workspace_id")
      .eq("id", data.projectId)
      .single();
    if (pErr) throw new Error(pErr.message);

    const { data: statuses, error: sErr } = await client
      .from("task_statuses")
      .select("id, name, color, category, position, is_default")
      .eq("workflow_id", project.workflow_id)
      .order("position", { ascending: true });
    if (sErr) throw new Error(sErr.message);

    const { data: tasks, error: tErr } = await client
      .from("tasks")
      .select(
        "id, title, description, priority, type, task_number, slug, status_id, due_date, created_at",
      )
      .eq("project_id", data.projectId)
      .eq("is_archived", false)
      .order("task_number", { ascending: true });
    if (tErr) throw new Error(tErr.message);

    return { project, statuses: statuses ?? [], tasks: tasks ?? [] };
  });

export const createTask = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().uuid(),
      title: z.string().min(1).max(200),
      description: z.string().max(5000).optional(),
      statusId: z.string().uuid().optional(),
      priority: z
        .enum(["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST"])
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { getAuthedClient } = await import("@/lib/auth.server");
    const { client, user } = await getAuthedClient();

    const { data: project, error: pErr } = await client
      .from("projects")
      .select("id, workflow_id")
      .eq("id", data.projectId)
      .single();
    if (pErr) throw new Error(pErr.message);

    let statusId = data.statusId;
    if (!statusId) {
      const { data: status, error: sErr } = await client
        .from("task_statuses")
        .select("id")
        .eq("workflow_id", project.workflow_id)
        .eq("is_default", true)
        .maybeSingle();
      if (sErr) throw new Error(sErr.message);
      statusId = status?.id;
      if (!statusId) {
        const { data: first } = await client
          .from("task_statuses")
          .select("id")
          .eq("workflow_id", project.workflow_id)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle();
        statusId = first?.id;
      }
    }
    if (!statusId) throw new Error("No workflow status available");

    const { data: last } = await client
      .from("tasks")
      .select("task_number")
      .eq("project_id", data.projectId)
      .order("task_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const taskNumber = (last?.task_number ?? 0) + 1;
    const { data: task, error: tErr } = await client
      .from("tasks")
      .insert({
        project_id: data.projectId,
        status_id: statusId,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? "MEDIUM",
        task_number: taskNumber,
        slug: taskSlug(taskNumber, data.title),
        created_by_id: user.id,
      })
      .select(
        "id, title, description, priority, type, task_number, slug, status_id, due_date, created_at",
      )
      .single();
    if (tErr) throw new Error(tErr.message);
    return task;
  });

export const moveTask = createServerFn({ method: "POST" })
  .validator(
    z.object({
      taskId: z.string().uuid(),
      statusId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { getAuthedClient } = await import("@/lib/auth.server");
    const { client } = await getAuthedClient();
    const { data: status } = await client
      .from("task_statuses")
      .select("id, category")
      .eq("id", data.statusId)
      .single();

    const { data: task, error } = await client
      .from("tasks")
      .update({
        status_id: data.statusId,
        completed_at:
          status?.category === "DONE" ? new Date().toISOString() : null,
      })
      .eq("id", data.taskId)
      .select(
        "id, title, description, priority, type, task_number, slug, status_id, due_date, created_at",
      )
      .single();
    if (error) throw new Error(error.message);
    return task;
  });
