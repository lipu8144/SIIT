-- ════════════════════════════════════════════════════════════
-- SIIT — migration 0002 (Phase 4 ERP core)
-- Run AFTER 0001_init.sql.
-- ════════════════════════════════════════════════════════════

-- ── students ─────────────────────────────────────────────────
create table if not exists public.students (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.users(id) on delete set null,
  enrollment_no  text unique,
  name           text not null,
  email          text,
  phone          text,
  course_id      text,
  course_name    text,
  batch          text,
  address        text,
  photo_url      text,
  status         text not null default 'active',   -- active | inactive
  joined_at      date not null default current_date
);

-- ── teachers ─────────────────────────────────────────────────
create table if not exists public.teachers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.users(id) on delete set null,
  name           text not null,
  email          text,
  phone          text,
  subjects       text[] default '{}',
  qualification  text,
  experience_yrs int default 0,
  status         text not null default 'active',
  joined_at      date not null default current_date
);

-- ── managed_courses ──────────────────────────────────────────
create table if not exists public.managed_courses (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text,
  duration_months  int default 3,
  fee              numeric(10,2) default 0,
  teacher_id       uuid references public.teachers(id) on delete set null,
  seats            int default 25,
  enrolled         int default 0,
  status           text not null default 'active'
);

-- ── attendance ───────────────────────────────────────────────
create table if not exists public.attendance (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  student_name text,
  date         date not null,
  status       char(1) not null check (status in ('P','A','L')),
  unique(student_id, date)
);

-- ── results ──────────────────────────────────────────────────
create table if not exists public.results (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  student_name text,
  course_id    uuid references public.managed_courses(id) on delete set null,
  course_name  text,
  subject      text not null,
  marks        numeric(5,2) not null,
  max_marks    numeric(5,2) not null default 100,
  grade        text,
  published    boolean not null default false
);

-- ════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════

alter table public.students       enable row level security;
alter table public.teachers       enable row level security;
alter table public.managed_courses enable row level security;
alter table public.attendance     enable row level security;
alter table public.results        enable row level security;

-- students: read own row, staff can do everything
create policy "students self read"  on public.students for select using (user_id = auth.uid() or public.is_staff());
create policy "students staff all"  on public.students for all    using (public.is_staff());

-- teachers: staff only
create policy "teachers staff all"  on public.teachers        for all using (public.is_staff());
create policy "courses staff all"   on public.managed_courses for all using (public.is_staff());
create policy "attendance staff all"on public.attendance      for all using (public.is_staff());

-- results: students can read their own published results
create policy "results self read"   on public.results for select
  using (published = true and student_id in (
    select id from public.students where user_id = auth.uid()
  ) or public.is_staff());
create policy "results staff all"   on public.results for all using (public.is_staff());
