# Taskosaur → OWeb Conversion Plan

> Convert Taskosaur from NestJS + Redis + self-hosted Postgres into an
> **OWeb-style** app: TanStack Start on Vercel + Supabase (auth/DB) + Vercel Cron/Queues.
> Pattern reference: [SalesflowOne/OWeb-Intelligence](https://github.com/SalesflowOne/OWeb-Intelligence).

## Status

| Phase | Name | Status |
|-------|------|--------|
| **0** | Scaffold `oweb/` (TanStack Start, Vercel, Supabase) | ✅ In progress |
| **1** | Core PM schema + RLS (org → workspace → project → task) | ✅ In progress |
| **2** | Auth (Supabase) + onboarding + default workflow/statuses | ✅ In progress |
| **3** | App UI: dashboard, project board, task CRUD | ✅ In progress |
| **4** | Vercel Cron for recurring tasks (replaces Nest `@Cron`) | ✅ In progress |
| **5** | Sprints, labels, comments, attachments (Blob/Storage) | ⏳ Next |
| **6** | Realtime (Supabase Realtime replaces Socket.io) | ⏳ |
| **7** | Automations via Vercel Queues/Workflows | ⏳ |
| **8** | AI chat (Vercel AI SDK / AI Gateway) | ⏳ |
| **9** | Integrations (Jira/Trello via Composio or HTTP cron) | ⏳ |
| **10** | Inbox/email (Resend inbound — no IMAP on Vercel) | ⏳ |
| **11** | Retire `backend/` + `frontend/` legacy Nest/Next stack | ⏳ |

## Architecture target

```
┌─────────────────────────────────────────────┐
│  Vercel (TanStack Start + Nitro)            │
│  - SSR UI + server functions                │
│  - /api/cron/* (Vercel Cron)                │
│  - Queues/Workflows (later)                 │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│  Supabase                                   │
│  - Auth (replaces JWT/refresh Nest auth)    │
│  - Postgres + RLS (replaces Prisma host)    │
│  - Storage (replaces local uploads / S3)    │
│  - Realtime (replaces Socket.io)            │
└─────────────────────────────────────────────┘
```

## Explicit non-goals for Phase 0–4

- No NestJS on Vercel
- No Redis / BullMQ
- No local disk uploads
- No IMAP long-poll workers
- Legacy `backend/` and `frontend/` remain for reference until Phase 11

## Mapping (Taskosaur → OWeb)

| Taskosaur | OWeb replacement |
|-----------|------------------|
| NestJS HTTP API | TanStack Start server routes + `createServerFn` |
| Prisma + self-hosted Postgres | Supabase Postgres + SQL migrations |
| Custom JWT auth | Supabase Auth |
| Socket.io gateway | Supabase Realtime channels |
| BullMQ + Redis | Vercel Queues / Workflows + Cron HTTP |
| Nest `@Cron` | `vercel.json` crons → `/api/cron/*` |
| Local `uploads/` | Supabase Storage / Vercel Blob |
| IMAP inbox sync | Deferred → Resend inbound webhooks |
| Next.js static export SPA | TanStack Start SSR (same process as API) |

## Deploy

1. Create Vercel project with **Root Directory = `oweb`**
2. Create Supabase project; apply `oweb/supabase/migrations/*`
3. Set env vars from `oweb/.env.example`
4. Point domain / Supabase redirect URLs at the Vercel URL

## Working directory

All new product code lives in **`oweb/`**.  
Legacy Nest/Next stays in `backend/` and `frontend/` until cutover.
