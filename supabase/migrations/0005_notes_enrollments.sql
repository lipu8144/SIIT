-- ════════════════════════════════════════════════════════════
-- SIIT — migration 0005 (notes + enrollments + notes bucket)
-- Run AFTER 0004_site_settings.sql.
-- ════════════════════════════════════════════════════════════

-- ── notes / study material ───────────────────────────────────
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null default 'pdf',        -- pdf | video | assign
  url         text,                                -- storage URL or external link
  course_id   uuid references public.managed_courses(id) on delete set null,
  course      text default '',                     -- denormalised course name
  description text default '',
  published   boolean default true,
  created_at  timestamptz default now()
);

alter table public.notes enable row level security;

-- students see published notes; staff manage everything
create policy "notes read published" on public.notes for select
  using (published = true or public.is_staff());
create policy "notes staff write" on public.notes for all
  using (public.is_staff());

-- ── enrollments (student ↔ course, many-to-many) ─────────────
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  course_id   uuid not null references public.managed_courses(id) on delete cascade,
  status      text not null default 'active',     -- active | completed | dropped
  progress    int  not null default 0,            -- 0-100
  enrolled_at date default current_date,
  unique (student_id, course_id)
);

alter table public.enrollments enable row level security;

-- students read their own enrollments; staff manage all
create policy "enrollments self read" on public.enrollments for select
  using (
    student_id in (select id from public.students where user_id = auth.uid())
    or public.is_staff()
  );
create policy "enrollments staff write" on public.enrollments for all
  using (public.is_staff());

-- ── notes storage bucket ─────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('notes','notes',true)
on conflict (id) do nothing;

-- ── keep managed_courses.enrolled in sync with enrollments ───
create or replace function public.sync_course_enrolled()
returns trigger language plpgsql security definer as $$
begin
  update public.managed_courses c
     set enrolled = (select count(*) from public.enrollments e
                      where e.course_id = c.id and e.status = 'active')
   where c.id = coalesce(new.course_id, old.course_id);
  return coalesce(new, old);
end $$;

drop trigger if exists trg_sync_enrolled on public.enrollments;
create trigger trg_sync_enrolled
  after insert or update or delete on public.enrollments
  for each row execute function public.sync_course_enrolled();

-- ── seed a few notes ─────────────────────────────────────────
insert into public.notes (title, type, course, description) values
  ('Computer Fundamentals — Chapter 1', 'pdf',    'OS-CIT',         'Introduction to computer hardware and software.'),
  ('MS-Office Shortcuts Reference',     'pdf',    'OS-CIT',         'Handy keyboard shortcuts for Word, Excel, PowerPoint.'),
  ('Tally Data Entry Practice File',    'pdf',    'Tally with GST', 'Practice vouchers and ledger entries.'),
  ('Excel VLOOKUP Tutorial',            'video',  'Advanced Excel', 'Step-by-step VLOOKUP and XLOOKUP walkthrough.'),
  ('Assignment — Balance Sheet',        'assign', 'Tally with GST', 'Prepare a balance sheet from the given trial balance.')
on conflict do nothing;
