# SIIT — Setup Guide (start to finish)

Follow the parts **in order**. Total time: about 45–60 minutes the first time.

| Part | What you do | Time |
|---|---|---|
| 1 | Run the website on your computer (demo mode) | 5 min |
| 2 | Create the Supabase project | 5 min |
| 3 | Run the database SQL files | 10 min |
| 4 | Connect the website to Supabase | 3 min |
| 5 | Set up admin-created logins | 10 min |
| 6 | Create the first super admin and test | 5 min |
| 7 | Put the site live on Vercel | 10 min |
| 8 | Hand over to the client | — |

**You need:** a computer with [Node.js](https://nodejs.org) 18 or newer, a free
[Supabase](https://supabase.com) account, a free [GitHub](https://github.com)
account and a free [Vercel](https://vercel.com) account.

---

## Part 1 — Run it on your computer (demo mode)

Do this first to make sure the project opens. No Supabase needed yet.

1. Unzip `SIIT-FrontEnd.zip`. Open the folder in a terminal.
2. Install:
   ```bash
   npm install
   ```
3. Start:
   ```bash
   npm run dev
   ```
4. Open **http://localhost:5173**. The site should load.
5. Click **Login**. In demo mode use `admin` / `admin123` (admin) or `student` / `stud123` (student).

In demo mode everything resets when you refresh the page. That is normal. It
means Supabase is **not** connected yet. Stop the server (Ctrl+C) and continue.

---

## Part 2 — Create the Supabase project

1. Go to **supabase.com → New project**.
2. Give it a name (for example `siit`), choose a strong database password (save it), choose the region nearest to India (**Mumbai / ap-south-1** if shown), and click **Create**. Wait 1–2 minutes.
3. Open **Project Settings → API**. Copy these two values somewhere safe:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **anon public** key (a long text starting with `eyJ...`)

> **Never** use or share the `service_role` key. The website does not need it.
> Only the Edge Function in Part 5 uses it, and Supabase gives it to the function automatically.

---

## Part 3 — Run the SQL files

1. In Supabase, open **SQL Editor → New query**.
2. For each file below, **in this exact order**: open it from the `supabase/migrations/` folder, copy everything, paste into the editor, click **Run**, and wait for "Success".

| Order | File | What it does |
|---|---|---|
| 1 | `0001_init.sql` | Users, blogs, events, gallery, testimonials, roles, security |
| 2 | `0002_erp.sql` | Students, teachers, courses, attendance, results |
| 3 | `0003_growth.sql` | Leads, quiz, analytics tables |
| 4 | `0004_site_settings.sql` | Site settings, counters |
| 5 | `0005_notes_enrollments.sql` | Notes, enrollments, file storage |
| 6 | `0006_site_config.sql` | Footer / contact / timings |
| 7 | `0007_fix_is_staff_recursion.sql` | Fixes a login bug |
| 8 | `0008_admin_created_logins.sql` | User IDs + security fix |
| 9 | `seed.sql` | Sample blogs, events, gallery, testimonials |
| 10 | `seed_erp_growth.sql` | Sample courses, teachers, students, leads |

3. If a file shows an error, stop. Do not continue to the next one. Fix or re-run that file first.

> **About the sample data (files 9 and 10):** the client gets a filled-in site
> to start from. Public sample content (blogs, testimonials, events, gallery,
> courses) is visible to visitors, so the client should replace it from the
> admin dashboard. Students, teachers and leads are only visible to admins.
> If the client wants an empty site, skip files 9 and 10.

---

## Part 4 — Connect the website to Supabase

1. In the project folder, copy `.env.example` to a new file named `.env`.
2. Open `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://abcdxyz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your anon key...
   VITE_LOGIN_EMAIL_BASE="siitsurada@gmail.com"
   ```
   - `VITE_LOGIN_EMAIL_BASE` can stay as it is. **Choose it once and never change it later** (existing logins would stop working). It must match the function secret in Part 5.
3. Everything else in `.env` is optional (contact details, social links, EmailJS, analytics). You can fill them later.
4. Run `npm run dev` again. The "Demo logins" hint on the login page should now be **gone**. That tells you Supabase is connected.

---

## Part 5 — Admin-created logins

Students do not sign up. The admin creates their User ID and password. This
needs one small server function and one setting.

### 5A. Deploy the `admin-users` function (no installs needed)

1. Supabase → **Edge Functions → Deploy a new function → Via Editor**.
2. Name: exactly `admin-users`.
3. Delete the sample code. Open `supabase/functions/admin-users/index.ts` from the project, copy all, paste.
4. Click **Deploy**. Leave **Verify JWT** switched **ON**.

(Prefer the command line? `supabase login`, then `supabase link --project-ref YOUR_REF`, then `supabase functions deploy admin-users`.)

### 5B. Turn off public signup

1. Supabase → **Authentication → Sign In / Providers** (named **Settings** in some dashboards).
2. Turn **OFF** "Allow new users to sign up". Save.

You can ignore "Confirm email". It no longer matters.

---

## Part 6 — Create the first super admin, then test

1. Supabase → **Authentication → Users → Add user → Create new user**.
   Enter a real email and a strong password. Tick **Auto Confirm User**. Create.
2. **SQL Editor** → run this (use the same email):
   ```sql
   UPDATE public.users
   SET role = 'super_admin', name = 'Super Admin'
   WHERE email = 'the-admin-email@example.com';
   ```
   It should say "1 row affected". If it says 0 rows, run:
   ```sql
   INSERT INTO public.users (id, email, name, role)
   SELECT id, email, 'Super Admin', 'super_admin'
   FROM auth.users WHERE email = 'the-admin-email@example.com';
   ```
3. Run the site (`npm run dev`), open `/signin`. In the **User ID** box type the admin **email**, enter the password, **Sign In**. You should land on **/admin**.
4. Open **/auth-check**. Every line should be green. A red line tells you exactly what is missing.
5. Create a test student: **Admin → Users & Roles → Create Login**.
   - Account type: student
   - Link to student record: pick one (so their data shows in their portal)
   - Click **Create Login**, then copy the User ID and password from the card.
6. Sign out. Sign in with that User ID and password. You should land on the **student portal** and see only that student's data.

If all six steps work, the backend is finished.

---

## Part 7 — Put it live on Vercel

1. Create a GitHub repository and upload the project:
   ```bash
   git init
   git add .
   git commit -m "SIIT"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/siit.git
   git push -u origin main
   ```
   (`.env` is ignored automatically, so your keys are not uploaded.)
2. Go to **vercel.com/new**, import the repository. Vercel detects Vite by itself. Do not change the build settings.
3. Before clicking Deploy, open **Environment Variables** and add (copy values from your `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_LOGIN_EMAIL_BASE`
   - any contact / social values you filled in
4. Click **Deploy**. In about a minute the site is live at `https://your-project.vercel.app`.
5. Test on the live link: sign in as admin, open `/auth-check`, create a student login, sign in as that student.
6. **Custom domain:** Vercel → Project → **Settings → Domains** → add the client's domain → copy the DNS records Vercel shows into the domain provider. HTTPS is automatic.

> Changed an environment variable later? Vercel needs a **Redeploy** for it to take effect.

---

## Part 8 — Hand over to the client

Do these in the admin dashboard:

- [ ] **Site Settings:** correct phone, email, address, WhatsApp, map link, social links, timings.
- [ ] **Replace sample content:** Blogs, Events, Gallery (real photos), Testimonials (real students only), Courses and fees.
- [ ] **Teachers:** add the real faculty. The About page "Our Team" shows them automatically.
- [ ] **Students:** add real students, then give each a login from **Users & Roles → Create Login**.
- [ ] **Notifications:** set the announcement bar message.
- [ ] Show the client how to: create a login, reset a password, mark attendance, enter results, upload notes.
- [ ] Give the client the super admin email and password.

**Optional extras**
- Contact form emails: create a free [EmailJS](https://emailjs.com) account and fill the three `VITE_EMAILJS_*` values. Without it, every enquiry is still saved in **Leads CRM**, you just do not get an email.
- Visitor analytics: add `VITE_GA4_MEASUREMENT_ID`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Login page still shows "Demo logins" | `.env` keys are blank or the server was not restarted. On Vercel, add the variables and redeploy. |
| `npm run dev` fails | Check Node is 18+ (`node -v`). Run `npm install` again. |
| SQL error "already exists" | That file was run before. Safe to continue to the next file. |
| SQL error "relation does not exist" | An earlier file was skipped. Run the files in order. |
| Admin login goes to the student portal or home | The role is not `super_admin`. Re-run the UPDATE in Part 6, then sign out and in. Make sure migration 0007 ran. |
| "Login service is not set up yet" | `admin-users` is not deployed (Part 5A). |
| "Wrong User ID or password" for a new student | Use small letters. Or `VITE_LOGIN_EMAIL_BASE` and the function secret `LOGIN_EMAIL_BASE` are different. |
| Student portal is empty | The login is not linked to a student record. Recreate it with **Link to student record**. |
| Blank page after deploy on Vercel | Check `vercel.json` is in the project (it is included). |
| Anything else | Open `/auth-check` and read which line is red. |

---

## Security reminders

- Only the **anon** key goes in the website. Never put the `service_role` key anywhere in the project or in Vercel.
- Never upload `.env` to GitHub.
- There is no public signup. Only admins create logins.
