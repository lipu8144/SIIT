# SUPABASE_SETUP.md — Connect SIIT to Supabase

This guide takes you from dummy mode to a fully working backend in ~15 minutes.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `siit`, pick a region close to you, set a DB password
3. Wait ~2 minutes for provisioning

## 2. Get your keys

Go to **Settings → API** in the Supabase dashboard. Copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

Paste them into your `.env`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 3. Run the migrations

Go to **SQL Editor** in the Supabase dashboard. Run each file **in order**:

| # | File | What it creates |
|---|---|---|
| 1 | `supabase/migrations/0001_init.sql` | users, blogs, events, gallery, testimonials, notifications, RLS, storage, auth trigger |
| 2 | `supabase/migrations/0002_erp.sql` | students, teachers, managed_courses, attendance, results, RLS |
| 3 | `supabase/migrations/0003_growth.sql` | leads, quiz_submissions, seo_meta, RLS |
| 4 | `supabase/migrations/0004_site_settings.sql` | site_settings, increment RPC, extra RLS policies |
| 4b | `supabase/migrations/0005_notes_enrollments.sql` | notes, enrollments, notes bucket, enrolled-count trigger |
| 5 | `supabase/migrations/seed.sql` | Seed: blogs, events, gallery, testimonials, notifications |
| 6 | `supabase/migrations/seed_erp_growth.sql` | Seed: teachers, courses, students, leads |

Or use the Supabase CLI:
```bash
npx supabase db push
```

## 4. Create the admin user

In the Supabase dashboard:

1. Go to **Authentication → Users → Add User**
2. Email: `admin@siit.in`, Password: your choice
3. Copy the **User UID** from the table
4. Go to **SQL Editor** and run:
```sql
UPDATE public.users SET role = 'super_admin' WHERE email = 'admin@siit.in';
```

Now you can sign in as super_admin and create other staff accounts from Admin → Users & Roles.

## 5. (Not used) Google Sign-In
The app no longer uses Google or email sign-in. See STUDENT_LOGIN_SETUP.md.

## 5b. Old notes — Google Sign-In (ignore)

1. In Supabase: **Authentication → Providers → Google → Enable**
2. Set your Google OAuth Client ID and Secret (from Google Cloud Console)
3. Set the redirect URL Supabase gives you in Google Cloud Console

No code changes needed — the AuthProvider auto-detects Supabase OAuth.

## 6. Configure Storage (optional — for image uploads)

The migrations already create these storage buckets:
- `avatars` — user profile photos
- `blog-covers` — blog cover images
- `event-covers` — event cover images
- `gallery` — gallery media
- `notes` — study material (PDFs, videos, assignments)

Admin forms now include a **file picker** that uploads directly to Supabase Storage
and fills in the public URL automatically (Blogs, Courses, Gallery, Testimonials, Notes).
You can still paste an external URL using the "Paste URL" toggle.

In dummy mode the picker creates a temporary local preview instead.

## 7. Restart and verify

```bash
npm run dev
```

Open the app. If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, the app automatically uses Supabase for all data. You'll see:

- Real authentication (email/password + Google)
- All CRUD persists across sessions and devices
- RLS enforces permissions (students see their own data, staff can manage everything)
- Leads from the enrol popup and contact form go to the leads table
- Quiz submissions are stored permanently

## Architecture

```
Browser (React SPA)
  ↓ Supabase JS client (anon key + JWT)
  ↓
Supabase
  ├── Auth       → email/password, Google OAuth, JWT tokens
  ├── Database   → PostgreSQL with RLS (15 tables)
  ├── Storage    → avatars, blog-covers, event-covers, gallery
  └── Functions  → increment_setting RPC
```

**RLS (Row Level Security) summary:**

| Table | Public read | Student read own | Staff full access |
|---|---|---|---|
| blogs, events | Published only | — | ✓ |
| gallery, testimonials | All | — | ✓ |
| notifications | Active only | — | ✓ |
| site_settings, seo_meta | All | — | ✓ |
| students | — | Own row | ✓ |
| attendance | — | Own records | ✓ |
| results | — | Own published | ✓ |
| teachers, managed_courses | All (read) | — | ✓ |
| leads | — | — | ✓ |
| quiz_submissions | Insert (anon) | — | ✓ |
| users | Own row | — | ✓ |

## Troubleshooting

**"Invalid API key"** → Double-check `VITE_SUPABASE_ANON_KEY` in `.env`. Make sure it's the `anon` key, not the `service_role` key.

**"permission denied for table X"** → The RLS policies require the user to be authenticated. Make sure you're signed in. For public pages, the policies allow anonymous reads on published content.

**Data doesn't appear after migration** → Run `seed.sql` and `seed_erp_growth.sql` after the migration files.

**Google sign-in redirects to blank page** → Set the correct redirect URL in both Supabase Auth settings and Google Cloud Console OAuth credentials.


---
## Admin-created logins (migration 0008 + Edge Function)
Run `supabase/migrations/0008_admin_created_logins.sql` after 0007, then follow **STUDENT_LOGIN_SETUP.md**.
