-- ════════════════════════════════════════════════════════════
-- SIIT — migration 0007 (fix is_staff RLS recursion)
-- Run AFTER 0006_site_config.sql.
--
-- BUG: is_staff() queried public.users, but the "users self read" RLS
-- policy calls is_staff() — so reading a user row recursed infinitely.
-- Supabase raised "infinite recursion detected in policy", fetchProfile
-- failed, and every user (including admins) fell back to role=student,
-- so login never redirected to /admin.
--
-- FIX: mark is_staff() SECURITY DEFINER so it bypasses RLS while checking
-- the role, breaking the loop. Also split the users read policy so a user
-- can always read their OWN row without invoking is_staff() at all.
-- ════════════════════════════════════════════════════════════

-- 1. Recreate is_staff() as SECURITY DEFINER (bypasses RLS internally)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('admin', 'super_admin', 'teacher')
  );
$$;

-- 2. Rebuild the users read policy so self-read never calls is_staff()
drop policy if exists "users self read" on public.users;

-- a user can always read their own row (no function call → no recursion)
create policy "users read own" on public.users
  for select using (id = auth.uid());

-- staff can read every row (is_staff is now SECURITY DEFINER → safe)
create policy "users read all staff" on public.users
  for select using (public.is_staff());
