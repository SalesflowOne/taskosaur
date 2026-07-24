-- Taskosaur OWeb core PM schema (Phase 1)
-- Maps Nest/Prisma org → workspace → project → task onto Supabase Auth + RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.ts_role as enum ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_project_status as enum ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_project_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_project_visibility as enum ('PRIVATE', 'TEAM', 'PUBLIC');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_task_type as enum ('TASK', 'BUG', 'STORY', 'EPIC', 'SUBTASK');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_task_priority as enum ('LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_status_category as enum ('TODO', 'IN_PROGRESS', 'DONE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_recurrence_type as enum ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ts_recurrence_end_type as enum ('NEVER', 'ON_DATE', 'AFTER_COUNT');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  avatar text,
  timezone text not null default 'UTC',
  language text not null default 'en',
  default_organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organizations / workspaces / projects
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  avatar text,
  owner_id uuid not null references public.profiles (id),
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_default_organization_id_fkey;
alter table public.profiles
  add constraint profiles_default_organization_id_fkey
  foreign key (default_organization_id) references public.organizations (id) on delete set null;

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.ts_role not null default 'MEMBER',
  is_default boolean not null default false,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  color text,
  archive boolean not null default false,
  created_by_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.ts_role not null default 'MEMBER',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workspace_id)
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  is_default boolean not null default false,
  created_by_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_statuses (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  name text not null,
  color text not null,
  category public.ts_status_category not null,
  position int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, name)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  workflow_id uuid not null references public.workflows (id),
  name text not null,
  slug text not null,
  task_prefix varchar(8),
  description text,
  avatar text,
  color text not null default '#0F766E',
  status public.ts_project_status not null default 'PLANNING',
  priority public.ts_project_priority not null default 'MEDIUM',
  visibility public.ts_project_visibility not null default 'PRIVATE',
  archive boolean not null default false,
  created_by_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.ts_role not null default 'MEMBER',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  status_id uuid not null references public.task_statuses (id),
  title text not null,
  description text,
  type public.ts_task_type not null default 'TASK',
  priority public.ts_task_priority not null default 'MEDIUM',
  task_number int not null,
  slug text not null,
  start_date timestamptz,
  due_date timestamptz,
  completed_at timestamptz,
  story_points int,
  parent_task_id uuid references public.tasks (id) on delete set null,
  is_archived boolean not null default false,
  is_recurring boolean not null default false,
  created_by_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, task_number)
);

create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_status_id_idx on public.tasks (status_id);

create table if not exists public.task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, user_id)
);

create table if not exists public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks (id) on delete cascade,
  recurrence_type public.ts_recurrence_type not null,
  interval int not null default 1,
  days_of_week int[] not null default '{}',
  day_of_month int,
  month_of_year int,
  end_type public.ts_recurrence_end_type not null default 'NEVER',
  end_date timestamptz,
  occurrence_count int,
  current_occurrence int not null default 1,
  is_active boolean not null default true,
  next_occurrence timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws_id and m.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.workspaces w
    join public.organization_members om on om.organization_id = w.organization_id
    where w.id = ws_id and om.user_id = auth.uid()
  );
$$;

create or replace function public.is_project_member(proj_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_id = proj_id and m.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.projects p
    join public.workspaces w on w.id = p.workspace_id
    join public.organization_members om on om.organization_id = w.organization_id
    where p.id = proj_id and om.user_id = auth.uid()
  );
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'first_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at triggers
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists organizations_updated_at on public.organizations;
create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

drop trigger if exists workspaces_updated_at on public.workspaces;
create trigger workspaces_updated_at before update on public.workspaces
  for each row execute function public.set_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workflows enable row level security;
alter table public.task_statuses enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.recurring_tasks enable row level security;

-- Profiles
create policy "profiles_select_own_or_org" on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.organization_members a
      join public.organization_members b on a.organization_id = b.organization_id
      where a.user_id = auth.uid() and b.user_id = profiles.id
    )
  );
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid());

-- Organizations
create policy "orgs_select_member" on public.organizations for select
  using (public.is_org_member(id) or owner_id = auth.uid());
create policy "orgs_insert_authenticated" on public.organizations for insert
  with check (owner_id = auth.uid());
create policy "orgs_update_member_admin" on public.organizations for update
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = id and m.user_id = auth.uid()
        and m.role in ('OWNER', 'ADMIN')
    )
  );

create policy "org_members_select" on public.organization_members for select
  using (public.is_org_member(organization_id) or user_id = auth.uid());
create policy "org_members_insert" on public.organization_members for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_id and m.user_id = auth.uid()
        and m.role in ('OWNER', 'ADMIN')
    )
  );

-- Workspaces
create policy "workspaces_select" on public.workspaces for select
  using (public.is_workspace_member(id));
create policy "workspaces_insert" on public.workspaces for insert
  with check (public.is_org_member(organization_id));
create policy "workspaces_update" on public.workspaces for update
  using (public.is_workspace_member(id));

create policy "workspace_members_select" on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));
create policy "workspace_members_insert" on public.workspace_members for insert
  with check (public.is_workspace_member(workspace_id) or user_id = auth.uid());

-- Workflows / statuses
create policy "workflows_select" on public.workflows for select
  using (public.is_org_member(organization_id));
create policy "workflows_insert" on public.workflows for insert
  with check (public.is_org_member(organization_id));

create policy "task_statuses_select" on public.task_statuses for select
  using (
    exists (
      select 1 from public.workflows w
      where w.id = workflow_id and public.is_org_member(w.organization_id)
    )
  );
create policy "task_statuses_insert" on public.task_statuses for insert
  with check (
    exists (
      select 1 from public.workflows w
      where w.id = workflow_id and public.is_org_member(w.organization_id)
    )
  );

-- Projects
create policy "projects_select" on public.projects for select
  using (public.is_project_member(id));
create policy "projects_insert" on public.projects for insert
  with check (public.is_workspace_member(workspace_id));
create policy "projects_update" on public.projects for update
  using (public.is_project_member(id));

create policy "project_members_select" on public.project_members for select
  using (public.is_project_member(project_id));
create policy "project_members_insert" on public.project_members for insert
  with check (public.is_project_member(project_id) or user_id = auth.uid());

-- Tasks
create policy "tasks_select" on public.tasks for select
  using (public.is_project_member(project_id));
create policy "tasks_insert" on public.tasks for insert
  with check (public.is_project_member(project_id));
create policy "tasks_update" on public.tasks for update
  using (public.is_project_member(project_id));
create policy "tasks_delete" on public.tasks for delete
  using (public.is_project_member(project_id));

create policy "task_assignees_all" on public.task_assignees for all
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and public.is_project_member(t.project_id)
    )
  )
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and public.is_project_member(t.project_id)
    )
  );

create policy "recurring_tasks_all" on public.recurring_tasks for all
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and public.is_project_member(t.project_id)
    )
  )
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_id and public.is_project_member(t.project_id)
    )
  );
