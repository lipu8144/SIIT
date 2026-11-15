# GO_LIVE_CHECKLIST.md — SIIT Client Production Launch

This is the complete list to take SIIT from code to a live client site.
Code-level production issues are already fixed. The remaining items need
the client's accounts, content, and domain.

---

## ✅ Already done (in code)

- EmailJS keys moved out of source into env vars (no secrets committed)
- Demo login hint hidden in production (only shows in demo mode)
- Demo seed users gated — never used for auth when Supabase is connected
- All contact details, socials, WhatsApp, and map are env-configurable
  via `src/config/site.js`
- SPA routing config for Vercel (`vercel.json`)
- Clean production build verified

---

## 1. Backend — Supabase (REQUIRED)

- [ ] Run all 6 migrations in the Supabase SQL editor **in order**:
      `0001` → `0002` → `0003` → `0004` → `0005` → `0006` → `0007` → `0008` → then `seed.sql`
      and `seed_erp_growth.sql`
      *(See SUPABASE_SETUP.md for details.)*
- [ ] **Seed data (Option A — chosen):** run both seed files. This gives the
      client a fully populated site to start from:
      - 5 blogs, 3 events, 6 gallery items, 4 testimonials, 1 notification
      - 4 teachers, 7 courses, 10 students, 5 leads
      - 9 enrollments, sample results, current-month attendance, 5 notes
      The client then edits/replaces this via the admin panel — no empty tables.
- [ ] **Tell the client which seed content is public** and should be reviewed
      first (it shows to visitors): **blogs, testimonials, events, gallery,
      courses, site-settings stat numbers**. Students/teachers/leads/attendance
      are admin-only (internal) and safe to keep as sample data until replaced.
- [ ] Create the client's admin account in **Authentication → Users**
- [ ] Promote it:
      ```sql
      UPDATE public.users SET role = 'super_admin' WHERE email = 'THEIR_EMAIL';
      ```
- [ ] (Optional) Connect a real student login to a seeded student row so the
      portal shows their data:
      ```sql
      UPDATE public.students SET user_id = 'AUTH_UID' WHERE enrollment_no = 'SIIT/2024/001';
      ```

### Student logins (admin-created) — do these once
Full steps are in **STUDENT_LOGIN_SETUP.md**. In short:
- [ ] Run migration `0008_admin_created_logins.sql`
- [ ] Deploy the `admin-users` Edge Function
- [ ] Turn OFF "Allow new users to sign up" in Supabase Auth
- [ ] Create the first super admin, then create students from Admin → Users

## 2. Environment variables in Vercel

Add under **Settings → Environment Variables**, then redeploy:

**Required**
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_LOGIN_EMAIL_BASE` (same value as the function's `LOGIN_EMAIL_BASE`)

**Client details** (defaults are the real SIIT Sorada info — change if needed)
- [ ] `VITE_CONTACT_PHONE`
- [ ] `VITE_CONTACT_EMAIL`
- [ ] `VITE_CONTACT_ADDRESS`
- [ ] `VITE_WHATSAPP_NUMBER` (format: `917873987123`, no + or spaces)
- [ ] `VITE_MAP_EMBED_URL` (Google Maps → Share → Embed → copy src)
- [ ] `VITE_SOCIAL_INSTAGRAM` / `_FACEBOOK` / `_YOUTUBE` (blank hides the icon)

**Optional**
- [ ] `VITE_EMAILJS_SERVICE_ID` / `_TEMPLATE_ID` / `_PUBLIC_KEY`
      (client's own EmailJS account — without these, enquiries still save
      as leads, they just don't also send an email)
- [ ] `VITE_GA4_MEASUREMENT_ID` (Google Analytics)

## 3. Content (client provides)

- [ ] Replace placeholder hero/about images in `src/assets/` with real photos
      (or upload via the admin panel where supported)
- [ ] Real courses, fees, durations → add in Admin → Courses
- [ ] Real blog posts → Admin → Blogs
- [ ] Real testimonials with student photos → Admin → Testimonials
- [ ] Real gallery images → Admin → Gallery
- [ ] Real events → Admin → Events
- [ ] Homepage/About stat numbers → Admin → Site Settings

## 4. Domain & hosting

- [ ] Deploy to Vercel (see DEPLOY_VERCEL.md)
- [ ] Add the client's custom domain in Vercel → Settings → Domains
- [ ] Point the domain's DNS to Vercel (Vercel shows the exact records)
- [ ] SSL is automatic on Vercel once DNS resolves

## 5. Pre-launch QA (on the live URL)

- [ ] Admin → Users → Create Login for a test student → sign out → sign in with that User ID and password → lands on the student portal
- [ ] Open `/signup` → it redirects to the login page (there is no public signup)
- [ ] Open `/auth-check` while signed in as admin → every line is green
- [ ] Sign in as the client admin → full dashboard works
- [ ] Add a course in admin → appears on `/courses` and homepage
- [ ] Submit the contact form → lead appears in Admin → Leads
- [ ] Submit an enrol popup → lead appears + enquiry counter rises
- [ ] Take the career quiz → recommendations show
- [ ] Refresh on a deep link (e.g. `/about`) → still loads
- [ ] Open on a phone → sidebars are hamburger menus, layout is clean
- [ ] Data persists after refresh (confirms Supabase is connected)

## 6. Handover

- [ ] Give the client their admin login
- [ ] Walk them through: adding courses, blogs, managing leads, enrollments,
      notes, notifications, and site settings
- [ ] Show them how to change stat numbers and content without a developer

---

## Security notes

- The Supabase **anon key is safe to expose** in the frontend — Row Level
  Security (RLS) protects the data. Never put the `service_role` key in
  frontend env vars.
- Only `super_admin` (set directly in the DB) can assign admin/teacher roles.
- There is no public signup. Only an admin creates logins (through the
  `admin-users` Edge Function, which checks the caller's role on the server).
- Migration 0008 stops anyone changing their own role.
- `.env` is gitignored; only `.env.example` (no real values) is committed.

## Still optional / future

- Event registrations (dedicated table exists, service not yet wired)
- File uploads currently go to Supabase Storage via the admin image picker
- FAQ content is currently static (could be made admin-editable)
