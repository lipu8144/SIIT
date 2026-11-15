# SETUP_NOTES — what was added to make this project run

The uploaded archive contained all the **new / upgraded** platform files
described in the README, but not the build scaffolding or the
"existing / unchanged" files the README references. This document records
exactly what was created and fixed so the project builds and runs.

Verified with: `npm install` → `npm run build` (✓ 1321 modules) and
`npm run dev` (serves `/`, `/courses`, etc. with HTTP 200).

## 1. Build scaffolding (was missing)
- `package.json` — pins every dependency the source imports
  (react, react-dom, react-router-dom, framer-motion, react-icons,
  react-hot-toast, recharts, swiper, @emailjs/browser, @supabase/supabase-js)
  plus the Vite + Tailwind toolchain.
- `index.html`, `vite.config.js`, `postcss.config.js`, `.gitignore`
- `tailwind.config.js` — brand tokens copied verbatim from the README
  (buttons_1 #eb0249, buttons_2 #f18032, twitter #1DA1F2, overlay #1c3fdb,
  body #edf4ff, text_color2 #42506a). **Tokens were not changed.**
- `src/main.jsx`, `src/index.css`
- `.env` (created from `.env.example`, dummy mode on)

## 2. "Existing / unchanged" files reconstructed
These were imported across the app but absent from the archive. They were
rebuilt to match the design system and the exact export shapes the pages
expect (named vs default):
- `src/common/session.jsx` — storeInSession / lookInSession / removeFromSession / logOutUser
- `src/common/firebase.jsx` — `authWithGoogle()` (real Firebase if keys+package present, demo login otherwise)
- `src/common/page-animation.jsx` — `AnimationWrapper` (default)
- `src/API/DummyCourses.jsx` — `fakeFetchCourses` → `{ data: { courses } }`
- `src/components/Navbar.component.jsx`, `Footer.component.jsx`, `Loader.jsx`,
  `UserNavigationPanel.jsx`, `ChooseUS.jsx` (`ChooseUs`),
  `Categories.components.jsx` (`Categories`), `Courses.component.jsx` (default),
  `Faq.components.jsx` (`Faq`), `Newsletter.component.jsx` (`Newsletter`),
  `EnrolePopup.jsx` (default)
- `src/assets/` — hero3, hero4, about1, about2, join_us (brand-colored placeholders)
- `public/loader.gif`, `public/favicon.svg`

## 3. Bugs fixed in the provided code
- **`src/data/seed.js`** — added the missing `notifications` export that
  `src/pages/admin/AdminContent.jsx` imports (the file's own comment flagged
  this as a Phase-4 TODO). Without it the build failed to resolve the import.
- **`src/App.jsx`** — the student pages were loaded with a top-level
  `await import(...)`, which the default Vite/browser target rejects. Replaced
  with `React.lazy(() => import(...).then(m => ({ default: m.X })))`, keeping
  lazy-loading and removing the unsupported top-level await.

## 4. Housekeeping
- Removed junk directories created by a broken brace-expansion `mkdir`
  (e.g. `siit/{src/{pages/...}`).
- Renamed the project root to `SIIT-FrontEnd/` to match the README.

## Demo logins (dummy mode — no backend needed)
| Role        | Email             | Password | Lands on |
|-------------|-------------------|----------|----------|
| Super Admin | admin@siit.test   | admin123 | /admin   |
| Teacher     | teacher@siit.test | teach123 | /portal  |
| Student     | student@siit.test | stud123  | /portal  |

## Notes
- Firebase is an **optional** dependency. The app runs with a demo Google
  login out of the box. To enable real Google auth: `npm install firebase`
  and set the `VITE_FIREBASE_*` vars in `.env`.
- To go live on Supabase, follow "Connecting Supabase" in the README.

## 5. Student portal fixes (added after initial setup)
- **`src/pages/student/StudentPages.jsx`** — the last line was
  `export default StudentDashboard;` but `StudentDashboard` is defined in
  a *different* file (`StudentDashboard.jsx`). This caused a `ReferenceError`
  the moment the module loaded, which killed all five named exports
  (StudentCourses, StudentAttendance, StudentResults, StudentNotes,
  StudentProfile). Replaced with a comment — these are named exports only,
  and `App.jsx` already wraps each with `.then(m => ({ default: m.X }))`.
- **`tailwind.config.js`** — added missing color/font tokens used 90+ times
  across admin and student pages: `text-dark-grey` → `#6b7a90`,
  `bg-grey` / `border-grey` → `#e2e8f0`, `text-text_color1` → `#1b2447`,
  `font-gelasio` → Gelasio serif.
- **`src/index.css`** — added Google Fonts import for Gelasio, and added
  the `btn-dark` component class used 12 times in admin/student panels.
