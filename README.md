> **New here? Start with [SETUP_GUIDE.md](SETUP_GUIDE.md)** — full step-by-step setup, from running it locally to going live.

# SIIT — Smart Institute of Information Technology
### Premium Education ERP + LMS + Marketing Website
**Stack:** Vite · React 18 · Tailwind CSS · Framer Motion · Supabase-ready

---

## Quick Start

```bash
git clone <your-repo>
cd SIIT-FrontEnd
npm install
cp .env.example .env        # fill in values (leave VITE_USE_SUPABASE=false to run on dummy data)
npm run dev
```

**Demo logins (dummy mode — no backend needed):**

| Role        | Email                   | Password   | Landing       |
|-------------|-------------------------|------------|---------------|
| Super Admin | admin@siit.test         | admin123   | /admin        |
| Teacher     | teacher@siit.test       | teach123   | /portal       |
| Student     | student@siit.test       | stud123    | /portal       |

---

## Project Architecture

```
SIIT-FrontEnd/
├── public/
│   └── loader.gif
├── src/
│   ├── App.jsx                        ← Root router (all 6 phases wired)
│   ├── main.jsx
│   ├── index.css
│   │
│   ├── assets/                        ← Images, icons (unchanged from original)
│   │
│   ├── API/
│   │   └── DummyCourses.jsx           ← Legacy fake-fetch for public Courses page
│   │
│   ├── common/                        ← Shared utilities
│   │   ├── firebase.jsx               ← Google Auth (Firebase)
│   │   ├── session.jsx                ← sessionStorage helpers
│   │   ├── page-animation.jsx         ← AnimationWrapper (Framer Motion)
│   │   └── Reveal.jsx                 ← [NEW] Scroll-reveal component
│   │
│   ├── context/
│   │   └── AuthProvider.jsx           ← [NEW] 4-role auth (dummy ↔ Supabase)
│   │
│   ├── lib/                           ← Integration stubs
│   │   ├── supabaseClient.js          ← [NEW] Supabase client (disabled until keys set)
│   │   ├── whatsapp.js                ← [NEW] WhatsApp Cloud API stub
│   │   └── email.js                   ← [NEW] Resend / SMTP email stub
│   │
│   ├── data/                          ← Dummy seed data (shapes match Supabase tables)
│   │   ├── seed.js                    ← blogs, events, gallery, testimonials, users
│   │   ├── erpSeed.js                 ← students, teachers, courses, attendance, results
│   │   └── growthSeed.js              ← leads, quiz submissions, analytics, SEO meta
│   │
│   ├── services/                      ← Data access layer (THE SWAP SEAM)
│   │   ├── db.js                      ← blogService, eventService, galleryService, testimonialService
│   │   ├── erpDb.js                   ← studentService, teacherService, courseManagementService,
│   │   │                                  attendanceService, resultService
│   │   └── growthDb.js                ← leadService, quizService, analyticsService, seoService
│   │
│   ├── components/
│   │   ├── Hero.component.jsx         ← [UPGRADED] Animated hero (floating laptop, course cards)
│   │   ├── Testimonial.component.jsx  ← [UPGRADED] DB-backed, star ratings, Swiper
│   │   ├── Navbar.component.jsx       ← Existing (unchanged)
│   │   ├── Footer.component.jsx       ← Existing (unchanged)
│   │   ├── Courses.component.jsx      ← Existing homepage courses section (unchanged)
│   │   ├── ChooseUS.jsx               ← Existing (unchanged)
│   │   ├── Faq.components.jsx         ← Existing (unchanged)
│   │   ├── Newsletter.component.jsx   ← Existing (unchanged)
│   │   ├── Categories.components.jsx  ← Existing (unchanged)
│   │   ├── EnrolePopup.jsx            ← Existing (unchanged)
│   │   ├── Loader.jsx                 ← Existing (unchanged)
│   │   ├── UserNavigationPanel.jsx    ← Existing (unchanged)
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.jsx    ← [NEW] Top bar: typed, scheduled, dismissible
│   │   │   └── Popup.jsx             ← [NEW] Modal/side/bottom popup system
│   │   ├── admin/
│   │   │   └── CrudTable.jsx         ← [NEW] Reusable table + modal + form fields
│   │   └── student/                  ← (reserved for future student components)
│   │
│   └── pages/
│       ├── Home.page.jsx              ← [UPGRADED] + events widget + quiz CTA
│       ├── About.page.jsx             ← [UPGRADED] + timeline, counters, founder, faculty
│       ├── Courses.page.jsx           ← [UPGRADED] Search, filter, modal, popular badges
│       ├── Contact.page.jsx           ← [UPGRADED] Animated form, WhatsApp, timings, map
│       ├── Blog.page.jsx              ← [NEW] DB-backed: featured, categories, search, grid
│       ├── BlogDetail.page.jsx        ← [NEW] Slug-based detail + related posts
│       ├── Events.page.jsx            ← [NEW] Upcoming/past tabs, countdown, registration
│       ├── Gallery.page.jsx           ← [NEW] Album filter, masonry, lightbox
│       ├── Quiz.page.jsx              ← [NEW] 5-step AI career quiz + recommendation engine
│       ├── UserAuthForm.jsx           ← Sign-in only (User ID + password). Logins are created by the admin.
│       │
│       ├── admin/
│       │   ├── AdminLayout.jsx        ← Dark sidebar, nav, user info, sign-out
│       │   ├── AdminDashboard.jsx     ← Stats cards, bar chart, recent tables
│       │   ├── AdminBlogs.jsx         ← Full CRUD: title, slug, category, status, featured
│       │   ├── AdminEvents.jsx        ← Full CRUD: dates, location, capacity, registration
│       │   ├── AdminContent.jsx       ← AdminNotifications + AdminGallery + AdminTestimonials
│       │   ├── AdminNotifications.jsx ← Re-export from AdminContent
│       │   ├── AdminGallery.jsx       ← Re-export from AdminContent
│       │   ├── AdminTestimonials.jsx  ← Re-export from AdminContent
│       │   ├── AdminStudents.jsx      ← CRUD + stats, enrollment, batch, status
│       │   ├── AdminTeachers.jsx      ← CRUD, subjects, qualification, experience
│       │   ├── AdminCourses.jsx       ← CRUD + fees, seats, teacher assignment
│       │   ├── AdminAttendance.jsx    ← P/A/L bulk marking + monthly report
│       │   ├── AdminResults.jsx       ← Marks entry, auto-grade, publish, report card
│       │   ├── AdminLeads.jsx         ← CRM: table + kanban, pipeline, WhatsApp dial
│       │   ├── AdminAnalytics.jsx     ← Visitor trend, device, sources, funnel (Recharts)
│       │   └── AdminSEO.jsx           ← Per-page meta title/desc/OG/keywords editor
│       │
│       └── student/
│           ├── StudentLayout.jsx      ← Sidebar, nav, sign-out (role: student)
│           ├── StudentDashboard.jsx   ← Welcome, progress rings, attendance, results
│           └── StudentPages.jsx       ← StudentCourses + StudentAttendance + StudentResults
│                                          + StudentNotes + StudentProfile
│
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql             ← users, blogs, events, gallery, testimonials,
│       │                                notifications + RLS + storage buckets + trigger
│       ├── 0002_erp.sql              ← students, teachers, managed_courses,
│       │                                attendance, results + RLS
│       ├── 0003_growth.sql           ← leads, quiz_submissions, seo_meta + RLS + seed
│       └── seed.sql                  ← Supabase seed (mirrors dummy data)
│
├── .env.example                       ← All env vars documented
├── vite.config.js                     ← Existing
├── tailwind.config.js                 ← Existing (brand tokens UNCHANGED)
└── README.md                          ← This file
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
# Existing
VITE_SERVER_DOMAIN="https://siit-backend-am52.onrender.com"

# Supabase — set VITE_USE_SUPABASE=true + add keys to go live
VITE_USE_SUPABASE="false"
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""

# Integrations (Phase 5 stubs — uncomment when ready)
# VITE_WHATSAPP_TOKEN=""
# VITE_WHATSAPP_PHONE_ID=""
# VITE_EMAIL_PROVIDER="resend"
# VITE_RESEND_API_KEY=""
# VITE_EMAIL_FROM="SIIT <no-reply@siit.in>"
# VITE_GA4_MEASUREMENT_ID=""
```

---

## Phase Delivery Summary

| Phase | What was built | Status |
|-------|---------------|--------|
| 1 | Premium public site: Hero, Courses, About, Contact, Reveal scroll-reveal, AnnouncementBar, Popup | ✅ Done |
| 2 | Data layer: service swap seam (db.js), dummy seeds, Supabase client placeholder, auth provider, Blog (list + detail), Events, Gallery, Testimonials, SQL migrations | ✅ Done |
| 3 | Sign-in / Sign-up pages (fixed missing file), Admin dashboard shell, CRUD for Blogs/Events/Notifications/Gallery/Testimonials | ✅ Done |
| 4 | ERP core: Students, Teachers, Courses management, Attendance (P/A/L + monthly report), Results (auto-grade + report card) | ✅ Done |
| 5 | Growth layer: Lead CRM (table + kanban), Analytics dashboard, AI Career Quiz, SEO manager, WhatsApp/Email stubs, Home events widget + Quiz CTA | ✅ Done |
| 6 | Student Portal: Dashboard (progress rings), My Courses, Attendance view, Results + download, Notes & Assignments, Profile edit | ✅ Done |

---

## Data Layer — The Swap Seam

Every page imports from the **service layer**, never from seed data or Supabase directly:

```js
// ✅ correct — always do this
import { blogService }    from "../services/db";
import { studentService } from "../services/erpDb";
import { leadService }    from "../services/growthDb";

// ❌ never do this in a page
import { blogs } from "../data/seed";
import { supabase } from "../lib/supabaseClient";
```

Each service method runs dummy data now and Supabase when `VITE_USE_SUPABASE=true` + keys are set — no page changes needed.

---

## Connecting Supabase (when ready)

```bash
# 1. Install the client
npm install @supabase/supabase-js

# 2. In src/lib/supabaseClient.js — uncomment these two lines:
#    import { createClient } from "@supabase/supabase-js";
#    supabase = createClient(url, anonKey);

# 3. In your Supabase SQL editor — run in order:
#    supabase/migrations/0001_init.sql
#    supabase/migrations/0002_erp.sql
#    supabase/migrations/0003_growth.sql
#    supabase/migrations/seed.sql

# 4. In .env:
VITE_USE_SUPABASE="true"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# 5. Restart dev server — done. No component changes.
```

---

## Component Reference

### Layout Components

| Component | Location | Props / Notes |
|-----------|----------|---------------|
| `AnnouncementBar` | `components/layout/` | `announcements[]` — typed (admission/event/exam/general), scheduled, localStorage dismiss |
| `Popup` | `components/layout/` | `config` — variant (modal/side/bottom), image, CTA, auto-open delay, "don't show again" |
| `Navbar` | `components/` | Reads `UserContext.userAuth` for avatar/login state |
| `Footer` | `components/` | Static; social links + certifications |

### Shared UI

| Component | Location | Props / Notes |
|-----------|----------|---------------|
| `Reveal` | `common/` | `index`, `as`, `amount` — Framer Motion `whileInView` scroll reveal |
| `CrudTable` | `components/admin/` | `title`, `columns`, `rows`, `onAdd`, `onEdit`, `onDelete`, `searchKeys` |
| `CrudModal` | `components/admin/` | `open`, `onClose`, `title`, `onSubmit`, `loading` |
| `FormField` | `components/admin/` | `label`, `required` — wraps any input |

### Public Pages

| Page | Route | Key Features |
|------|-------|-------------|
| `Home.page` | `/` | Hero, ChooseUs, Categories, Courses, FAQ, Events widget, Quiz CTA, Testimonials, Newsletter |
| `About.page` | `/about` | Achievement counters, animated timeline, founder message, faculty showcase |
| `Courses.page` | `/courses` | Search, category filter, animated cards, popular badges, details modal, enrol CTA |
| `Contact.page` | `/contact` | Animated form (EmailJS), WhatsApp CTA, office hours, Google Map |
| `Blog.page` | `/blog` | Featured post, category filter, search, animated grid |
| `BlogDetail.page` | `/blog/:slug` | Full article, related posts |
| `Events.page` | `/events` | Upcoming/past tabs, countdown timer, registration button |
| `Gallery.page` | `/gallery` | Album filter, masonry layout, lightbox (image + video) |
| `Quiz.page` | `/quiz` | 5-step animated quiz, local recommendation engine, course + career + salary results |

### Admin Pages (`/admin/*`) — requires role: admin | super_admin

| Page | Route | Key Features |
|------|-------|-------------|
| `AdminDashboard` | `/admin` | Stats cards, student growth bar chart, recent content tables |
| `AdminBlogs` | `/admin/blogs` | CRUD: title, slug, category, featured flag, status, publish date |
| `AdminEvents` | `/admin/events` | CRUD: dates, location, capacity, registration toggle |
| `AdminNotifications` | `/admin/notifications` | CRUD: type, message, CTA, schedule, active toggle |
| `AdminGallery` | `/admin/gallery` | CRUD: album, image/video type, URL, caption |
| `AdminTestimonials` | `/admin/testimonials` | CRUD: name, photo, course, review, rating, featured |
| `AdminStudents` | `/admin/students` | CRUD + stats: enrollment #, course, batch, status |
| `AdminTeachers` | `/admin/teachers` | CRUD: subjects, qualification, experience |
| `AdminCourses` | `/admin/courses` | CRUD: fees, seats, enrolled count, teacher assignment |
| `AdminAttendance` | `/admin/attendance` | Daily P/A/L marking, bulk save, monthly summary report |
| `AdminResults` | `/admin/results` | Marks entry, auto-grade, publish/unpublish, report card modal |
| `AdminLeads` | `/admin/leads` | CRM: table + kanban pipeline, 5 stages, WhatsApp dial, conversion stats |
| `AdminAnalytics` | `/admin/analytics` | Visitor trend, device pie, traffic sources, top pages, conversion funnel |
| `AdminSEO` | `/admin/seo` | Per-page meta title/description/OG image/keywords with char counters |

### Student Portal Pages (`/portal/*`) — requires any authenticated role

| Page | Route | Key Features |
|------|-------|-------------|
| `StudentDashboard` | `/portal` | Welcome, progress rings (attendance/score/course), quick links, recent results |
| `StudentCourses` | `/portal/courses` | Enrolled courses, progress bar, module checklist |
| `StudentAttendance` | `/portal/attendance` | P/A/L history, summary cards, low-attendance warning |
| `StudentResults` | `/portal/results` | Published results table, overall grade, CSV download |
| `StudentNotes` | `/portal/notes` | PDF/video/assignment cards with download |
| `StudentProfile` | `/portal/profile` | View and edit name, email, phone, address |

---

## Routing Map

```
/                     → Home
/about                → About
/courses              → Courses
/contact              → Contact
/blog                 → Blog list
/blog/:slug           → Blog detail
/events               → Events
/gallery              → Gallery
/quiz                 → AI Career Quiz
/signin               → Sign In
/signup               → redirects to /signin (no public signup)
/admin                → Admin Dashboard        [admin, super_admin]
/admin/blogs          → Blog management        [admin, super_admin]
/admin/events         → Event management       [admin, super_admin]
/admin/notifications  → Notification manager   [admin, super_admin]
/admin/gallery        → Gallery manager        [admin, super_admin]
/admin/testimonials   → Testimonial manager    [admin, super_admin]
/admin/students       → Student management     [admin, super_admin]
/admin/teachers       → Teacher management     [admin, super_admin]
/admin/courses        → Course management      [admin, super_admin]
/admin/attendance     → Attendance module      [admin, super_admin]
/admin/results        → Result management      [admin, super_admin]
/admin/leads          → Lead CRM               [admin, super_admin]
/admin/analytics      → Analytics dashboard    [admin, super_admin]
/admin/seo            → SEO manager            [admin, super_admin]
/portal               → Student Dashboard      [all roles]
/portal/courses       → My Courses             [all roles]
/portal/attendance    → My Attendance          [all roles]
/portal/results       → My Results             [all roles]
/portal/notes         → Notes & Assignments    [all roles]
/portal/profile       → My Profile             [all roles]
```

---

## Brand Tokens (Tailwind — DO NOT CHANGE)

```js
buttons_1: "#eb0249"   // primary red-pink (CTAs, badges, highlights)
buttons_2: "#f18032"   // secondary orange (accents, stats)
twitter:   "#1DA1F2"   // blue (links, info)
overlay:   "#1c3fdb"   // deep blue (hero gradients, admin sidebar)
body:      "#edf4ff"   // page background
text_color2: "#42506a" // body text
```

---

## Integration Activation Checklist

### WhatsApp Cloud API
1. Meta Developer App → WhatsApp product → get token + Phone Number ID
2. Set `VITE_WHATSAPP_TOKEN` and `VITE_WHATSAPP_PHONE_ID` in `.env`
3. Uncomment the `fetch()` call in `src/lib/whatsapp.js → _send()`
4. Route through Supabase Edge Function (never expose token in browser)

### Email (Resend)
1. Sign up at resend.com → verify domain → get API key
2. Set `VITE_EMAIL_PROVIDER=resend` and `VITE_RESEND_API_KEY` in `.env`
3. Uncomment the `fetch()` call in `src/lib/email.js → _sendResend()`
4. Route through Edge Function or server route

### Google Analytics 4
1. Create GA4 property → get Measurement ID
2. Set `VITE_GA4_MEASUREMENT_ID` in `.env`
3. Replace `analyticsService.getSnapshot()` in `growthDb.js` with GA4 Data API call

---

## Future-Ready Architecture Hooks
The codebase is structured to support (Phase 7+):
- **Online classes / Video portal** — `notes` table already has `type: video`
- **Paid courses** — add `price` column to `managed_courses`, Razorpay/Stripe integration
- **Student discussion forum** — new `posts` + `comments` tables
- **Digital certificates** — jsPDF generation from `results.reportCard()`
- **Push notifications** — Supabase Realtime + service worker
- **AI Chat Assistant** — Anthropic API via Edge Function
- **Online exams** — new `exams` + `exam_responses` tables
- **Placement portal** — new `job_listings` + `applications` tables
- **Mobile app** — React Native sharing the same Supabase backend
- **Multi-branch** — add `branch_id` to all tables + branch-scoped RLS policies
