-- ════════════════════════════════════════════════════════════
-- SIIT — migration 0003 (Phase 5 growth layer)
-- Run AFTER 0002_erp.sql.
-- ════════════════════════════════════════════════════════════

-- ── leads ────────────────────────────────────────────────────
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null,
  email           text,
  course_interest text,
  source          text default 'Website',
  status          text not null default 'new',   -- new|contacted|interested|follow_up|converted
  assigned_to     uuid references public.users(id) on delete set null,
  remarks         text default '',
  created_at      timestamptz not null default now()
);

-- ── quiz_submissions ──────────────────────────────────────────
create table if not exists public.quiz_submissions (
  id                  uuid primary key default gen_random_uuid(),
  answers             jsonb not null,
  recommended_courses text[] default '{}',
  converted           boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ── seo_meta ─────────────────────────────────────────────────
create table if not exists public.seo_meta (
  id          uuid primary key default gen_random_uuid(),
  page        text unique not null,   -- home|courses|about|blog|events|contact
  title       text,
  description text,
  og_image    text,
  keywords    text[] default '{}'
);

-- ════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════

alter table public.leads            enable row level security;
alter table public.quiz_submissions enable row level security;
alter table public.seo_meta         enable row level security;

-- leads: staff only
create policy "leads staff all" on public.leads for all using (public.is_staff());

-- quiz_submissions: anyone can insert (anonymous quiz), staff can read all
create policy "quiz insert anon"  on public.quiz_submissions for insert with check (true);
create policy "quiz staff read"   on public.quiz_submissions for select using (public.is_staff());
create policy "quiz staff update" on public.quiz_submissions for update using (public.is_staff());

-- seo_meta: public can read, staff can write
create policy "seo public read"  on public.seo_meta for select using (true);
create policy "seo staff write"  on public.seo_meta for all using (public.is_staff());

-- ── seed seo_meta rows ────────────────────────────────────────
insert into public.seo_meta (page, title, description, keywords) values
('home',    'SIIT — Smart Institute of Information Technology | Sorada', 'ISO certified computer institute in Sorada, Odisha. OS-CIT, Tally, Photoshop, Excel, Programming and more.', '{SIIT,computer institute,Sorada,OS-CIT,Tally}'),
('courses', 'Courses — SIIT Sorada | OS-CIT, Tally, Photoshop, Excel',  'Explore certified courses at SIIT — Web, Design, Accounting, MS-Office and Programming.',               '{SIIT courses,OS-CIT,Tally GST,Photoshop}'),
('about',   'About SIIT — 15 Years of Excellence in IT Education',       'Learn about SIIT mission, faculty and student success stories.',                                            '{about SIIT,IT education Odisha}'),
('blog',    'Blog — SIIT | Career Tips, Tutorials and Placement Stories','Guides, tutorials and career stories from the SIIT team.',                                                  '{SIIT blog,IT career tips,Tally tutorial}'),
('events',  'Events — SIIT | Workshops, Orientations and Seminars',      'Stay updated on SIIT workshops, batch orientations and campus events.',                                     '{SIIT events,computer workshop Sorada}'),
('contact', 'Contact SIIT — Sorada, Ganjam, Odisha | +91 7873987123',    'Get in touch with SIIT. Visit us at Sorada, Ganjam or call +91 7873987123.',                               '{contact SIIT,SIIT Sorada address}')
on conflict (page) do nothing;
