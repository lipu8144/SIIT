# DEPLOY_VERCEL.md — Put SIIT live on Vercel

The project is a static Vite + React SPA. It deploys to Vercel with no
server config. `vercel.json` is already included (it rewrites all routes
to `index.html` so deep links like `/admin/students` work).

Verified: clean `npm install` + `npm run build` succeeds, and the
production build serves all 35 routes with working deep links.

---

## Option A — GitHub → Vercel (recommended, auto-deploys)

1. **Push to GitHub**
   ```bash
   cd SIIT-FrontEnd
   git init
   git add .
   git commit -m "SIIT platform"
   git branch -M main
   git remote add origin https://github.com/<you>/siit.git
   git push -u origin main
   ```
   (`.gitignore` already excludes `node_modules`, `dist`, and `.env`.)

2. **Import on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repo
   - Vercel auto-detects **Vite** — framework preset, build command
     (`npm run build`), and output dir (`dist`) are filled in automatically
   - Click **Deploy**

3. **Done** — live at `https://<project>.vercel.app` in ~60 seconds.
   Every future `git push` auto-deploys.

---

## Option B — Vercel CLI (no GitHub)

```bash
npm install -g vercel
cd SIIT-FrontEnd
vercel
```
Answer the prompts (accept the Vite defaults). `vercel --prod` publishes
to production.

---

## Environment variables (optional)

**The app works immediately with NO env vars** — it runs in demo mode
(in-browser data, resets on refresh). Perfect for showing a live demo.

To connect the real Supabase backend, add these in Vercel:

1. Vercel dashboard → your project → **Settings → Environment Variables**
2. Add:
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | your project URL |
   | `VITE_SUPABASE_ANON_KEY` | your anon key |
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the vars take effect.

Optional extras (only if you use them): `VITE_FIREBASE_*`,
`VITE_EMAILJS_*`, `VITE_GA4_MEASUREMENT_ID`.

> Vite only exposes vars prefixed with `VITE_` to the browser. That's
> expected — the anon key is safe to expose; RLS protects your data.

---

## After deploy — quick checks

Visit your live URL and confirm:

- [ ] Home page loads with hero, courses, testimonials
- [ ] `/courses`, `/blog`, `/events`, `/gallery`, `/quiz`, `/contact` open
- [ ] Refresh on a deep link (e.g. `/about`) still loads (SPA rewrite works)
- [ ] Sign in with a demo account:
      - `admin@siit.test` / `admin123` → admin dashboard
      - `student@siit.test` / `stud123` → student portal
- [ ] Admin dashboard CRUD works (add a blog, see it on `/blog`)
- [ ] Mobile view — open on your phone, sidebars become hamburger menus

If Supabase is connected, also confirm an admin-created student login works and
data persists after refresh.

---

## Common gotchas

**Blank page after deploy** → almost always a missing SPA rewrite. Already
handled by `vercel.json`, but if you removed it, re-add:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Env vars not working** → they must start with `VITE_`, and you must
**redeploy** after adding them (they're baked in at build time).

**404 on refresh** → same as blank page: the SPA rewrite in `vercel.json`
fixes it.

**Build fails on Vercel but works locally** → make sure `package.json` and
`package-lock.json` are both committed (they are in this project).
