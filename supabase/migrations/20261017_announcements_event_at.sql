-- The site and admin console read and write announcements.event_at, but the live table
-- has no such column: every home-page load returns HTTP 400 (Postgres 42703) and the
-- admin "add announcement" insert fails. Run once in Supabase → SQL editor.
alter table public.announcements
  add column if not exists event_at timestamptz;

-- Check row-level security while you're here: every table must have RLS on, and the
-- anon role must only be able to SELECT active rows (writes only for signed-in admins).
select tablename, rowsecurity from pg_tables where schemaname = 'public';
select tablename, policyname, roles, cmd, qual, with_check from pg_policies where schemaname = 'public' order by tablename, cmd;
