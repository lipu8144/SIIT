/**
 * SIIT — dummy seed data (Phase 2)
 * Object shapes mirror the Supabase tables 1:1 (see supabase/migrations/0001_init.sql),
 * so swapping the service layer to Supabase requires no changes in the UI.
 */

export const blogs = [
  {
    id: "b1",
    title: "Why OS-CIT is the best first step into an IT career",
    slug: "oscit-first-step-it-career",
    excerpt:
      "A government-recognised certification that opens doors to office and computer-operator roles across Odisha.",
    body: "OS-CIT (Odisha State Certificate in Information Technology) is a foundational certification...\n\nIt covers computer fundamentals, MS-Office, the internet, and digital governance — the exact skills employers expect for entry-level office and operator roles.",
    cover_url: null,
    author: "SIIT Faculty",
    category: "Career",
    tags: ["OS-CIT", "career", "certification"],
    status: "published",
    featured: true,
    publish_at: "2026-06-12T09:00:00Z",
  },
  {
    id: "b2",
    title: "5 Excel formulas every accountant must know",
    slug: "5-excel-formulas-accountants",
    excerpt: "From VLOOKUP to SUMIFS — the formulas that save hours every week.",
    body: "Spreadsheets run on a handful of high-leverage formulas...",
    cover_url: null,
    author: "SIIT Faculty",
    category: "Tutorials",
    tags: ["excel", "accounting"],
    status: "published",
    featured: false,
    publish_at: "2026-06-08T09:00:00Z",
  },
  {
    id: "b3",
    title: "How Beenapani landed a Salesforce role",
    slug: "beenapani-salesforce-placement",
    excerpt: "A student success story from our placement program.",
    body: "After completing her course at SIIT, Beenapani prepared for...",
    cover_url: null,
    author: "Placement Cell",
    category: "Placements",
    tags: ["placement", "success-story"],
    status: "published",
    featured: false,
    publish_at: "2026-06-02T09:00:00Z",
  },
  {
    id: "b4",
    title: "Tally + GST: a complete beginner roadmap",
    slug: "tally-gst-beginner-roadmap",
    excerpt: "Everything a beginner needs to start with Tally and GST accounting.",
    body: "Tally with GST remains one of the most employable accounting skills...",
    cover_url: null,
    author: "SIIT Faculty",
    category: "Career",
    tags: ["tally", "gst", "accounting"],
    status: "published",
    featured: false,
    publish_at: "2026-05-28T09:00:00Z",
  },
  {
    id: "b5",
    title: "Photoshop basics: your first poster in an hour",
    slug: "photoshop-first-poster",
    excerpt: "Layers, text and export — a hands-on intro to Adobe Photoshop.",
    body: "Design is a skill anyone can start learning today...",
    cover_url: null,
    author: "SIIT Faculty",
    category: "Tutorials",
    tags: ["photoshop", "design"],
    status: "published",
    featured: false,
    publish_at: "2026-05-20T09:00:00Z",
  },
];

export const events = [
  {
    id: "e1",
    title: "OS-CIT July Batch — Orientation",
    slug: "oscit-july-orientation",
    description: "Kick-off and orientation for the new OS-CIT batch.",
    cover_url: null,
    starts_at: "2026-07-01T04:30:00Z",
    ends_at: "2026-07-01T06:30:00Z",
    location: "SIIT Campus, Sorada",
    status: "published",
    registration_open: true,
    capacity: 60,
  },
  {
    id: "e2",
    title: "Free Career Counselling Day",
    slug: "career-counselling-day",
    description: "One-on-one guidance on choosing the right course and career path.",
    cover_url: null,
    starts_at: "2026-07-15T04:00:00Z",
    ends_at: "2026-07-15T10:00:00Z",
    location: "SIIT Campus, Sorada",
    status: "published",
    registration_open: true,
    capacity: 100,
  },
  {
    id: "e3",
    title: "Annual Certificate Distribution 2025",
    slug: "certificate-distribution-2025",
    description: "Celebrating our certified students of 2025.",
    cover_url: null,
    starts_at: "2025-12-20T05:00:00Z",
    ends_at: "2025-12-20T08:00:00Z",
    location: "SIIT Campus, Sorada",
    status: "published",
    registration_open: false,
    capacity: null,
  },
];

export const gallery = [
  { id: "g1", album: "Campus", type: "image", url: null, caption: "Computer lab", created_at: "2026-01-10T00:00:00Z" },
  { id: "g2", album: "Events", type: "image", url: null, caption: "Certificate day 2025", created_at: "2025-12-20T00:00:00Z" },
  { id: "g3", album: "Classroom", type: "image", url: null, caption: "Tally class in session", created_at: "2026-02-02T00:00:00Z" },
  { id: "g4", album: "Campus", type: "image", url: null, caption: "Reception", created_at: "2026-01-12T00:00:00Z" },
  { id: "g5", album: "Events", type: "video", url: null, caption: "Orientation highlights", created_at: "2026-03-01T00:00:00Z" },
  { id: "g6", album: "Classroom", type: "image", url: null, caption: "Design workshop", created_at: "2026-02-20T00:00:00Z" },
];

export const testimonials = [
  {
    id: "t1",
    name: "Raj Kishore Panda",
    photo_url:
      "https://lh3.googleusercontent.com/a/ACg8ocLbM3Bx6dAZJeiJruyRa28hzWV_0frHWq2qRXx9q0Woa-fW1A=w75-h75-p-rp-mo-br100",
    course: "OS-CIT",
    review:
      "The best institute in our locality. Faculties are well behaved and teach well. A well maintained institute.",
    rating: 5,
    achievement: "Certified",
    featured: true,
  },
  {
    id: "t2",
    name: "Beenapani Nayak",
    photo_url:
      "https://lh3.googleusercontent.com/a/ACg8ocKZ252maztLpoBIpBqZnxStyZeJzugXO6Q9Agd296gCMlYWjaI=w75-h75-p-rp-mo-br100",
    course: "Salesforce",
    review:
      "An excellent organization. The instructor was superb and gave me the best coaching and career advice as I started my career.",
    rating: 5,
    achievement: "Placed",
    featured: true,
  },
  {
    id: "t3",
    name: "Sukanta Panigrahi",
    photo_url:
      "https://lh3.googleusercontent.com/a/ACg8ocLImTv_aH_9nkX9v5mbQo-Wwy0q9wRUEEMnUVcG6J3loMQxYis=w75-h75-p-rp-mo-br100",
    course: "Computer Basics",
    review: "Very good institute in our area for computer learning.",
    rating: 4,
    achievement: "Certified",
    featured: false,
  },
  {
    id: "t4",
    name: "Uma Shankar Panda",
    photo_url:
      "https://lh3.googleusercontent.com/a-/ALV-UjUjMSSqm4NTQ68wtebuRQHvuAJY7KzwWTS4qxwqf2V-1x4gtc8=w75-h75-p-rp-mo-br100",
    course: "Multiple Courses",
    review:
      "The best computer institute in Sorada. They provide all types of courses and all the faculty are very helpful.",
    rating: 5,
    achievement: "Certified",
    featured: false,
  },
];

/* dummy users for the mock auth provider (Phase 2) */
/* DEMO USERS — used ONLY in dummy mode (when Supabase is NOT configured).
   In production with Supabase connected, these are never used for auth:
   AuthProvider.signIn checks isSupabaseConfigured first. Real users live
   in the Supabase `users` table + Auth. Do NOT seed these into production. */
export const users = [
  { id: "u1", email: "admin@siit.test", username: "admin", password: "admin123", name: "Super Admin", role: "super_admin" },
  { id: "u2", email: "teacher@siit.test", username: "teacher", password: "teach123", name: "A. Mishra", role: "teacher" },
  { id: "u3", email: "student@siit.test", username: "student", password: "stud123", name: "Demo Student", role: "student" },
];

/* notifications — drives AdminNotifications CRUD and (shape-compatible
   with) the AnnouncementBar / Supabase `notifications` table.
   type ∈ admission | event | exam | general */
export const notifications = [
  {
    id: "n1",
    type: "admission",
    title: "New batch admissions open",
    body: "Seats filling fast for OS-CIT and ADCA. Enrol before the 30th to lock the early-bird fee.",
    cta_label: "Enrol now",
    cta_href: "/courses",
    active: true,
    starts_at: "2026-06-01",
    ends_at: "2026-07-31",
  },
  {
    id: "n2",
    type: "event",
    title: "Free career counselling day",
    body: "Walk in this Saturday for one-on-one guidance on choosing the right IT track.",
    cta_label: "See events",
    cta_href: "/events",
    active: true,
    starts_at: "2026-06-10",
    ends_at: "2026-07-10",
  },
  {
    id: "n3",
    type: "exam",
    title: "OS-CIT exam schedule released",
    body: "Check your hall ticket and reporting time in the student portal.",
    cta_label: "Open portal",
    cta_href: "/portal",
    active: true,
    starts_at: "2026-06-15",
    ends_at: "2026-06-28",
  },
  {
    id: "n4",
    type: "general",
    title: "Holiday notice",
    body: "The institute will remain closed on public holidays. Online resources stay available.",
    cta_label: "",
    cta_href: "",
    active: false,
    starts_at: "2026-05-01",
    ends_at: "2026-05-02",
  },
];

/* Site-wide settings — public stats, counters, and metrics
   manageable from Admin > Settings. Each stat has an id, label,
   value (numeric or string), suffix, and a group for UI layout. */
export const siteSettings = [
  { id: "ss1", key: "students_certified", label: "Students Certified", value: 500, suffix: "+", group: "hero" },
  { id: "ss2", key: "happy_learners",     label: "Happy Learners",     value: 100, suffix: "%", group: "hero" },
  { id: "ss3", key: "courses_offered",    label: "Courses Offered",    value: 50,  suffix: "+", group: "hero" },
  { id: "ss4", key: "years_excellence",   label: "Years of Excellence",value: 15,  suffix: "+", group: "about" },
  { id: "ss5", key: "hiring_partners",    label: "Hiring Partners",    value: 40,  suffix: "+", group: "about" },
  { id: "ss6", key: "placement_rate",     label: "Placement Rate",     value: 98,  suffix: "%", group: "about" },
  { id: "ss7", key: "page_visits",        label: "Page Visits",        value: 1250,suffix: "",  group: "dashboard" },
  { id: "ss8", key: "enquiries",          label: "Enquiries",          value: 0,   suffix: "",  group: "dashboard" },
];
