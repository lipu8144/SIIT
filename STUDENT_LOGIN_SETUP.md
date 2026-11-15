# Student Login Setup (admin creates every login)

## How it works

- **One login page** (`/signin`) for students, teachers and admins.
- Students **do not sign up** and **do not need an email**.
- The **super admin creates a User ID + password** for each student in
  **Admin → Users & Roles → Create Login**, then gives it to the student
  (Copy, or Send on WhatsApp).
- Forgot password? The student asks the office. The admin clicks
  **Reset password**. No email is ever sent.

You do this setup **once**. It takes about 15 minutes.

---

## Step 1 — Run the database migration

1. Supabase dashboard → **SQL Editor** → **New query**.
2. Open `supabase/migrations/0008_admin_created_logins.sql`, copy everything, paste, click **Run**.

(Migrations `0001` to `0007` must already be run. Order: 0001 → 0002 → 0003 → 0004 → 0005 → 0006 → 0007 → 0008.)

This adds the User ID column and also **closes a security hole**: before this,
a logged-in student could change their own role to admin.

---

## Step 2 — Deploy the `admin-users` function

This small server function is the only thing that can create logins. It keeps
the secret key safe (the secret key must never be inside the website code).

### Easiest way (no installs)

1. Supabase dashboard → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Name it exactly: `admin-users`
3. Delete the sample code. Open `supabase/functions/admin-users/index.ts` from this project, copy all of it, paste.
4. Click **Deploy**. Leave "Verify JWT" **ON**.

### Or with the command line

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy admin-users
```

### The login address base (important)

Supabase needs an email for every login, so a User ID like `siit-2024-001`
is silently turned into `siitsurada+siit-2024-001@gmail.com`. The student never
sees this and no mail is sent to it.

- The website uses `VITE_LOGIN_EMAIL_BASE` (default `siitsurada@gmail.com`).
- The function uses the secret `LOGIN_EMAIL_BASE` (same default).
- **Both must be the same.** If you keep the default in both places you do not need to do anything.
- To change it: Edge Functions → **Secrets** → add `LOGIN_EMAIL_BASE`, and set the same in `.env` / Vercel as `VITE_LOGIN_EMAIL_BASE`.
- **Choose it once and never change it later**, or existing logins will stop working.

---

## Step 3 — Turn off public signup

So nobody can create an account on their own:

1. Supabase → **Authentication** → **Sign In / Providers** (called *Settings* in some dashboards).
2. Turn **OFF**: **Allow new users to sign up**.
3. Save.

Admin-created logins still work, because the function is allowed to create them.
You can ignore the "Confirm email" setting. It no longer matters.

---

## Step 4 — Create the first super admin

1. Supabase → **Authentication → Users → Add user → Create new user**.
2. Enter a real email and a strong password. Tick **Auto Confirm User**. Create.
3. SQL Editor, run (use the same email):

```sql
UPDATE public.users
SET role = 'super_admin', name = 'Super Admin'
WHERE email = 'the-admin-email@example.com';
```

4. Go to your site `/signin`. In the **User ID** box type that **email**, enter the password, **Sign In**. You land on `/admin`.

(Staff can always sign in with a real email. Students use their User ID.)

---

## Step 5 — Check everything is connected

Sign in as the super admin, then open **`/auth-check`**. All lines should be green:

- Supabase keys
- Users table
- User ID column (migration 0008)
- Signed in
- Admin login service (admin-users function)

A red line tells you exactly what is missing.

---

## Everyday use: create a student login

1. **Admin → Users & Roles → Create Login**.
2. Account type: **student**.
3. (Recommended) **Link to student record**: pick the student. Name and User ID are filled automatically. Linking is what makes their courses, attendance and results show in their portal.
4. Check or change the **User ID** and **Password** (**New** makes a fresh random one).
5. **Create Login**.
6. A card shows the User ID and password **once**. Click **Send on WhatsApp** or **Copy details** and give it to the student.

### Forgot password
**Users & Roles → Reset password** next to the student → give them the new one.

### Student changes own password
Student portal → **Profile → Change password**.

### Student left the institute
**Users & Roles →** delete icon. They can no longer sign in. Their student record stays.

---

## Who can do what

| Action | Admin | Super admin |
|---|---|---|
| Create student / teacher login | Yes | Yes |
| Create admin login | No | Yes |
| Reset a student / teacher password | Yes | Yes |
| Reset or delete an admin | No | Yes |
| Delete the last super admin | No | No |
| Delete yourself | No | No |

---

## Problems

| What you see | Fix |
|---|---|
| "Login service is not set up yet" | The `admin-users` function is not deployed (Step 2). |
| "Only admins can do this" | You are signed in as a student or teacher. |
| "This User ID is already taken" | Choose another User ID. |
| `/auth-check` says User ID column missing | Run migration 0008 (Step 1). |
| New student cannot sign in, "Wrong User ID or password" | Check spelling (small letters). Or `LOGIN_EMAIL_BASE` and `VITE_LOGIN_EMAIL_BASE` are different (Step 2). |
| Student signs in but the portal is empty | The login is not linked to a student record. Delete and recreate it with **Link to student record**, or run: `UPDATE public.students SET user_id = 'AUTH-USER-ID' WHERE enrollment_no = '...';` |
| Someone created an account before you turned signup off | Their old account still works with their email typed in the User ID box. You can reset or delete it in Users & Roles. |
| Supabase rejects the base email | Use a different real address in `LOGIN_EMAIL_BASE` / `VITE_LOGIN_EMAIL_BASE`. A Gmail address always works. |
