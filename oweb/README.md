# Taskosaur OWeb

Vercel-native rewrite of Taskosaur using the **OWeb stack**:

- **TanStack Start** (SSR + server functions) on Vercel / Nitro
- **Supabase** Auth + Postgres + RLS (no self-hosted Nest/Postgres required)
- **Vercel Cron** for recurring tasks (no Redis / BullMQ)

Legacy NestJS + Next.js remain in `../backend` and `../frontend` until cutover.

## Quick start

```bash
cd oweb
cp .env.example .env
# Fill Supabase URL + keys
npm install
npm run dev
```

Apply SQL migrations in `supabase/migrations/` to your Supabase project (SQL editor or `supabase db push`).

## Deploy (Vercel)

1. New Vercel project → **Root Directory: `oweb`**
2. Framework: TanStack Start (auto-detected with Nitro)
3. Set env vars from `.env.example`
4. Apply migrations to Supabase
5. Add Supabase Auth redirect URLs for the Vercel domain

## Docs

See [`../plans/OWEB_CONVERSION_PLAN.md`](../plans/OWEB_CONVERSION_PLAN.md).
