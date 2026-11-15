-- ════════════════════════════════════════════════════════════
-- SIIT — Supabase migration 0001 (Phase 2 core)
-- Run in Supabase SQL editor, or `supabase db push` with the CLI.
-- Covers content tables + auth roles + RLS + storage buckets.
-- Later migrations add: students, teachers, attendance, results,
-- notes, assignments, leads, quiz_submissions, seo_meta.
-- ════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── roles ────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('super_admin','admin','teacher','student');
exception when duplicate_object then null; end $$;

-- ── users (profile rows; auth handled by auth.users) ─────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text,
  phone       text,
  role        user_role not null default 'student',
  created_at  timestamptz not null default now()
);

-- ── blogs ────────────────────────────────────────────────────
create table if not exists public.blogs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  excerpt     text,
  body        text,
  cover_url   text,
  author      text,
  category    text,
  tags        text[] default '{}',
  status      text not null default 'draft',     -- draft | published
  featured    boolean not null default false,
  publish_at  timestamptz default now()
);

-- ── events ───────────────────────────────────────────────────
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text unique not null,
  description       text,
  cover_url         text,
  starts_at         timestamptz,
  ends_at           timestamptz,
  location          text,
  status            text not null default 'draft',
  registration_open boolean not null default false,
  capacity          int
);

create table if not exists public.event_registrations (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid references public.events(id) on delete cascade,
  name      text not null,
  email     text,
  phone     text,
  created_at timestamptz not null default now()
);

-- ── gallery ──────────────────────────────────────────────────
create table if not exists public.gallery (
  id         uuid primary key default gen_random_uuid(),
  album      text,
  type       text not null default 'image',       -- image | video
  url        text,
  caption    text,
  created_at timestamptz not null default now()
);

-- ── testimonials ─────────────────────────────────────────────
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  photo_url   text,
  course      text,
  review      text,
  rating      numeric(2,1) default 5,
  achievement text,
  featured    boolean not null default false
);

-- ── notifications (announcement bar + popups) ────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'general',     -- admission | event | exam | general
  title      text,
  body       text,
  cta_label  text,
  cta_href   text,
  active     boolean not null default true,
  starts_at  timestamptz,
  ends_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
-- Row Level Security
-- Pattern: public can READ published content; staff can do everything.
-- ════════════════════════════════════════════════════════════
create or replace function public.is_staff() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role in ('admin','super_admin','teacher')
  );
$$;

-- users
alter table public.users enable row level security;
create policy "users self read"  on public.users for select using (id = auth.uid() or public.is_staff());
create policy "users self update" on public.users for update using (id = auth.uid());
create policy "users staff write" on public.users for all using (public.is_staff());

-- helper to apply the read-published / staff-all pattern
-- (inline per table below)

alter table public.blogs enable row level security;
create policy "blogs public read"  on public.blogs for select using (status = 'published' or public.is_staff());
create policy "blogs staff write"  on public.blogs for all using (public.is_staff());

alter table public.events enable row level security;
create policy "events public read" on public.events for select using (status = 'published' or public.is_staff());
create policy "events staff write" on public.events for all using (public.is_staff());

alter table public.event_registrations enable row level security;
create policy "regs insert anyone" on public.event_registrations for insert with check (true);
create policy "regs staff read"    on public.event_registrations for select using (public.is_staff());

alter table public.gallery enable row level security;
create policy "gallery public read" on public.gallery for select using (true);
create policy "gallery staff write" on public.gallery for all using (public.is_staff());

alter table public.testimonials enable row level security;
create policy "tms public read"  on public.testimonials for select using (true);
create policy "tms staff write"  on public.testimonials for all using (public.is_staff());

alter table public.notifications enable row level security;
create policy "notif public read" on public.notifications for select using (active = true or public.is_staff());
create policy "notif staff write" on public.notifications for all using (public.is_staff());

-- ════════════════════════════════════════════════════════════
-- Storage buckets
-- ════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values
  ('avatars','avatars',true),
  ('blog-covers','blog-covers',true),
  ('event-covers','event-covers',true),
  ('gallery','gallery',true)
on conflict (id) do nothing;

-- public read on those buckets; authenticated write
create policy "public read storage" on storage.objects for select using (true);
create policy "auth write storage"  on storage.objects for insert to authenticated with check (true);

-- ── new-user trigger: create a profile row on signup ─────────
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''), 'student')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
