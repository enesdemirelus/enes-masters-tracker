# Masters Tracker

A personal command center for master's program applications. The dashboard opens
on what needs attention — upcoming deadlines, letter progress, per-school
checklist completion, fees and decisions. **Schools** is the full sortable,
searchable table of programs, and each school gets its own workspace at
`/schools/<id>` with an editable checklist, recommendation-letter requests, key
dates (deadline, applied, decision), fee and portal links, and free-form notes.
**Deadlines** rolls every program up into overdue / next 7 days / later / done,
**Recommenders** tracks who is writing which letter and how far along it is, and
**Compare** puts up to four programs side by side. "Export data" in the sidebar
downloads the whole tracker as JSON. Single user, no auth; desktop sidebar
collapses to a drawer below 768px.

## Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [Mantine v8](https://mantine.dev) for UI
- [Prisma](https://www.prisma.io) as the ORM
- [Supabase Postgres](https://supabase.com) as the database

## Environment variables

Create a `.env` file with:

- `DATABASE_URL` — pooled Postgres connection string (used at runtime)
- `DIRECT_URL` — direct Postgres connection string (used for migrations)
- `LOGO_DEV_API_KEY` — API key for [logo.dev](https://logo.dev), used to fetch school logos

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the tracker.

## Schema changes

The Prisma schema lives at `prisma/schema.prisma`. After editing it, push the
changes to the database:

```bash
npx prisma db push
```

This also regenerates the Prisma Client (output at `app/generated/prisma`).
