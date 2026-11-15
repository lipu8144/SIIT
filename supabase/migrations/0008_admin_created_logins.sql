-- ════════════════════════════════════════════════════════════
-- SIIT — migration 0008 (admin-created logins + role security)
-- Run AFTER 0007_fix_is_staff_recursion.sql.
--
-- 1. Adds a `username` (User ID) column. Students sign in with this
--    instead of an email. The super admin creates it.
-- 2. SECURITY FIX: before this migration, any logged-in user could
--    change their OWN role to super_admin (policy "users self update"
--    had no column limit), and any teacher could change anyone's role
--    (policy "users staff write"). This closes both holes.
-- ════════════════════════════════════════════════════════════

-- ── 1. username column ──────────────────────────────────────
alter table public.users add column if not exists username text;

create unique index if not exists users_username_unique
  on public.users (lower(username))
  where username is not null;

-- ── 2. is_admin() helper (SECURITY DEFINER → no RLS recursion) ──
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('admin', 'super_admin')
  );
$$;

-- ── 3. Block role / username / email tampering ──────────────
-- Normal users can still edit their own name & phone. Only admins can
-- change role, username or email, and only a super_admin can grant the
-- admin / super_admin roles.
-- Requests with no logged-in user (Supabase SQL editor, or the
-- admin-users Edge Function using the service key) are allowed, so you
-- can still promote the first super admin from the SQL editor.
create or replace function public.protect_user_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.role     is distinct from old.role
  or new.username is distinct from old.username
  or new.email    is distinct from old.email then

    if not public.is_admin() then
      raise exception 'Only an admin can change role, user id or email';
    end if;

    if new.role is distinct from old.role
       and new.role in ('admin', 'super_admin')
       and not exists (
         select 1 from public.users
         where id = auth.uid() and role = 'super_admin'
       ) then
      raise exception 'Only a super admin can grant admin roles';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_user_columns on public.users;
create trigger protect_user_columns
  before update on public.users
  for each row execute function public.protect_user_columns();

-- ── 4. Only admins may write to the users table directly ────
-- (was: any staff incl. teachers). Reads are unchanged — see 0007.
drop policy if exists "users staff write" on public.users;
drop policy if exists "users admin write" on public.users;
create policy "users admin write" on public.users
  for all
  using (public.is_admin())
  with check (public.is_admin());
