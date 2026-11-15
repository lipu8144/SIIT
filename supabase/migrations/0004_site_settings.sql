-- ════════════════════════════════════════════════════════════
-- SIIT — migration 0004 (site_settings + fixes)
-- Run AFTER 0003_growth.sql.
-- ════════════════════════════════════════════════════════════

-- ── site_settings (admin-managed counters for Hero/About/Dashboard) ──
create table if not exists public.site_settings (
  id      uuid primary key default gen_random_uuid(),
  key     text unique not null,
  label   text not null,
  value   numeric not null default 0,
  suffix  text default '',
  "group" text not null default 'hero'   -- hero | about | dashboard
);

alter table public.site_settings enable row level security;
create policy "site_settings public read" on public.site_settings for select using (true);
create policy "site_settings staff write" on public.site_settings for all using (public.is_staff());

-- seed defaults
insert into public.site_settings (key, label, value, suffix, "group") values
  ('students_certified', 'Students Certified', 500, '+',  'hero'),
  ('happy_learners',     'Happy Learners',     100, '%',  'hero'),
  ('courses_offered',    'Courses Offered',     50, '+',  'hero'),
  ('years_excellence',   'Years of Excellence', 15, '+',  'about'),
  ('hiring_partners',    'Hiring Partners',     40, '+',  'about'),
  ('placement_rate',     'Placement Rate',      98, '%',  'about'),
  ('page_visits',        'Page Visits',       1250, '',   'dashboard'),
  ('enquiries',          'Enquiries',            0, '',   'dashboard')
on conflict (key) do nothing;

-- ── add thumbnail to managed_courses ─────────────────────────
alter table public.managed_courses add column if not exists thumbnail text;

-- ── allow anonymous lead/enquiry inserts (enrol popup, contact form) ──
create policy "leads public insert" on public.leads for insert with check (true);

-- ── allow students to read attendance ──
create policy "attendance self read" on public.attendance for select
  using (
    student_id in (select id from public.students where user_id = auth.uid())
    or public.is_staff()
  );

-- ── allow students to read managed_courses (public catalog) ──
create policy "courses public read" on public.managed_courses for select using (true);
create policy "courses staff write" on public.managed_courses for all using (public.is_staff());

-- ── allow teachers to read (for dropdowns) ──
create policy "teachers public read" on public.teachers for select using (true);

-- ── RPC to atomically increment a site_settings counter ──
create or replace function public.increment_setting(setting_key text, amount int default 1)
returns jsonb language plpgsql security definer as $$
declare
  result jsonb;
begin
  update public.site_settings
    set value = value + amount
    where key = setting_key
    returning jsonb_build_object('id', id, 'key', key, 'value', value) into result;
  return result;
end $$;
