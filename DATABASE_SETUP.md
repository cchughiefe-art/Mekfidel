# Mekfidel Supabase Database Setup

## Canonical setup file

Use only `supabase_sql_editor.sql` for a complete setup or repair. The other files under `sql/` are retained as historical migrations for existing deployments.

The canonical bootstrap is idempotent. It can be run on a new Supabase project or an existing Mekfidel database with only some tables installed. It does not drop tables or erase product, order, customer, or CMS content.

## Run it

1. Open the Mekfidel project in Supabase.
2. Open **SQL Editor** and create a new query.
3. Copy the entire `supabase_sql_editor.sql` file into the query.
4. Press **Run** and wait for `Success`.
5. Refresh the Mekfidel admin panel.

The script creates or repairs all application tables, indexes, update triggers, authentication profile hooks, row-level security policies, initial CMS content, storage buckets, and the AI change audit table. It also tells PostgREST to refresh its schema cache immediately.

## Why the web application does not execute CREATE TABLE

Supabase's normal browser and service-role REST clients work with rows, not PostgreSQL schema changes. Giving a public website a general SQL execution function would allow an application compromise to alter or destroy the database. Schema creation therefore remains one deliberate action in the protected Supabase SQL Editor.

After the bootstrap has run once, the application creates and updates normal CMS records itself. The AI assistant now tolerates an unavailable optional CMS table and reports it instead of blocking unrelated actions.

## Required Vercel variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (`gemini-3.5-flash`)

Never prefix the service-role key or Gemini key with `NEXT_PUBLIC_`.
