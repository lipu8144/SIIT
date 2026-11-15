-- ════════════════════════════════════════════════════════════
-- SIIT — migration 0006 (site_config: admin-editable contact info)
-- Run AFTER 0005_notes_enrollments.sql.
-- Key-value store for footer/contact details the client edits in
-- Admin > Site Settings (no developer or redeploy needed).
-- ════════════════════════════════════════════════════════════

create table if not exists public.site_config (
  key   text primary key,
  value text default '',
  label text default '',           -- human label shown in admin
  kind  text default 'text'        -- text | email | tel | url
);

alter table public.site_config enable row level security;
create policy "site_config public read" on public.site_config for select using (true);
create policy "site_config staff write" on public.site_config for all using (public.is_staff());

-- seed with the real SIIT details (client edits these from the dashboard)
insert into public.site_config (key, value, label, kind) values
  ('contact_phone',    '(+91) 7873987123',                          'Phone number',     'tel'),
  ('contact_email',    'siitsurada@gmail.com',                      'Email address',    'email'),
  ('contact_address',  'Main Road, Sorada, Ganjam, Odisha',         'Address',          'text'),
  ('whatsapp_number',  '917873987123',                              'WhatsApp number',  'tel'),
  ('map_embed_url',    '',                                          'Google Maps embed URL', 'url'),
  ('social_facebook',  '',                                          'Facebook URL',     'url'),
  ('social_instagram', 'https://instagram.com/oscit_siit_surada',   'Instagram URL',    'url'),
  ('social_youtube',   '',                                          'YouTube URL',      'url'),
  ('social_twitter',   '',                                          'Twitter / X URL',  'url')
on conflict (key) do nothing;

-- ── institute timings (editable from Admin → Site Settings) ──
insert into public.site_config (key, value, label, kind) values
  ('timing_weekday',  '9:00 AM – 7:00 PM', 'Timings — Mon to Fri', 'text'),
  ('timing_saturday', '9:00 AM – 2:00 PM', 'Timings — Saturday',    'text'),
  ('timing_sunday',   'Closed',            'Timings — Sunday',      'text')
on conflict (key) do nothing;
