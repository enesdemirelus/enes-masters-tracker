# Masters Tracker

A personal tracker for master's program applications: schools, tiers, deadlines,
and status, with a desktop and mobile view.

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
