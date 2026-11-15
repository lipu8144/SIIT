/**
 * SIIT — Phase 5 seed data
 * Shapes mirror the Supabase tables in 0003_growth.sql.
 * Import from growthDb.js (the service layer).
 */

export const leads = [
  { id: "l1",  name: "Ananya Behera",    phone: "9777100001", email: "ananya@example.com",  course_interest: "Tally with GST",  source: "Walk-in",    status: "new",       assigned_to: null, remarks: "",                             created_at: "2026-06-01T09:00:00Z" },
  { id: "l2",  name: "Subham Dash",      phone: "9777100002", email: "subham@example.com",  course_interest: "OS-CIT",          source: "Instagram",  status: "contacted", assigned_to: "t1", remarks: "Called on 2 Jun",               created_at: "2026-06-02T10:30:00Z" },
  { id: "l3",  name: "Mamata Sahu",      phone: "9777100003", email: "mamata@example.com",  course_interest: "Photoshop",       source: "WhatsApp",   status: "interested",assigned_to: "t3", remarks: "Demo scheduled for 10 Jun",     created_at: "2026-06-03T11:00:00Z" },
  { id: "l4",  name: "Pradeep Jena",     phone: "9777100004", email: "pradeep@example.com", course_interest: "Advanced Excel",  source: "Website",    status: "follow_up", assigned_to: "t2", remarks: "Follow up on fee discount",     created_at: "2026-06-04T08:00:00Z" },
  { id: "l5",  name: "Rina Tripathy",    phone: "9777100005", email: "rina@example.com",    course_interest: "OS-CIT",          source: "Referral",   status: "converted", assigned_to: "t4", remarks: "Enrolled Batch A Jul",          created_at: "2026-06-05T14:00:00Z" },
  { id: "l6",  name: "Deepak Mohanty",   phone: "9777100006", email: "deepak@example.com",  course_interest: "JAVA",            source: "Facebook",   status: "new",       assigned_to: null, remarks: "",                             created_at: "2026-06-10T09:00:00Z" },
  { id: "l7",  name: "Sasmita Sahoo",    phone: "9777100007", email: "sasmita@example.com", course_interest: "Tally with GST",  source: "Walk-in",    status: "contacted", assigned_to: "t2", remarks: "Interested in evening batch",   created_at: "2026-06-11T11:00:00Z" },
  { id: "l8",  name: "Bijendra Nayak",   phone: "9777100008", email: "bijendra@example.com",course_interest: "Blender",         source: "Instagram",  status: "interested",assigned_to: "t3", remarks: "Wants 3D animation track",     created_at: "2026-06-12T10:00:00Z" },
  { id: "l9",  name: "Sujata Pradhan",   phone: "9777100009", email: "sujata@example.com",  course_interest: "OS-CIT",          source: "WhatsApp",   status: "converted", assigned_to: "t4", remarks: "Fee paid, joining Jul 1",      created_at: "2026-06-13T09:30:00Z" },
  { id: "l10", name: "Amit Patnaik",     phone: "9777100010", email: "amit@example.com",    course_interest: "C++",             source: "Website",    status: "follow_up", assigned_to: "t1", remarks: "Needs parent approval",        created_at: "2026-06-14T15:00:00Z" },
];

export const quizSubmissions = [
  { id: "q1", answers: { interest: 0, education: 2, goal: 1, time: 2 }, recommended_courses: ["Tally with GST","Advanced Excel"], created_at: "2026-06-10T09:00:00Z", converted: true  },
  { id: "q2", answers: { interest: 1, education: 1, goal: 0, time: 1 }, recommended_courses: ["Photoshop","Graphic Design"],       created_at: "2026-06-11T11:00:00Z", converted: false },
  { id: "q3", answers: { interest: 2, education: 2, goal: 1, time: 2 }, recommended_courses: ["Web Development","JAVA"],           created_at: "2026-06-12T14:00:00Z", converted: false },
  { id: "q4", answers: { interest: 3, education: 0, goal: 0, time: 1 }, recommended_courses: ["OS-CIT","MS-Office"],               created_at: "2026-06-13T10:00:00Z", converted: true  },
  { id: "q5", answers: { interest: 0, education: 3, goal: 2, time: 3 }, recommended_courses: ["Tally with GST","Advanced Excel"],  created_at: "2026-06-14T09:00:00Z", converted: false },
];

/* Analytics snapshot — static for dummy mode; GA4 feeds this live later */
export const analyticsSnapshot = {
  overview: {
    totalVisitors:   12480,
    dailyVisitors:     342,
    weeklyVisitors:   2180,
    monthlyVisitors:  8940,
    returningVisitors:3210,
    newVisitors:      9270,
    avgSessionSec:     184,
    bounceRate:       38.4,
  },
  visitorTrend: [
    { day: "Mon", visitors: 420 }, { day: "Tue", visitors: 580 },
    { day: "Wed", visitors: 510 }, { day: "Thu", visitors: 670 },
    { day: "Fri", visitors: 620 }, { day: "Sat", visitors: 390 },
    { day: "Sun", visitors: 310 },
  ],
  deviceBreakdown: [
    { name: "Mobile", value: 62 }, { name: "Desktop", value: 31 }, { name: "Tablet", value: 7 },
  ],
  trafficSources: [
    { source: "Organic Search", pct: 38 }, { source: "Direct",        pct: 24 },
    { source: "Social Media",   pct: 22 }, { source: "Referral",      pct: 11 },
    { source: "Other",          pct:  5 },
  ],
  topPages: [
    { page: "/",        views: 4210, label: "Home" },
    { page: "/courses", views: 2840, label: "Courses" },
    { page: "/about",   views:  980, label: "About" },
    { page: "/contact", views:  760, label: "Contact" },
    { page: "/blog",    views:  640, label: "Blog" },
    { page: "/events",  views:  510, label: "Events" },
  ],
  conversionFunnel: [
    { stage: "Visited Site",    count: 12480 },
    { stage: "Viewed Courses",  count:  2840 },
    { stage: "Took Quiz",       count:   320 },
    { stage: "Filled Form",     count:   148 },
    { stage: "Enrolled",        count:    62 },
  ],
};

/* SEO meta — one row per page */
export const seoMeta = [
  { id: "seo-home",    page: "home",    title: "SIIT — Smart Institute of Information Technology | Sorada",       description: "ISO certified computer institute in Sorada, Odisha. OS-CIT, Tally, Photoshop, Excel, Programming and more.",    og_image: "", keywords: ["SIIT","computer institute","Sorada","OS-CIT","Tally"] },
  { id: "seo-courses", page: "courses", title: "Courses — SIIT Sorada | OS-CIT, Tally, Photoshop, Excel",        description: "Explore certified courses at SIIT — Web, Design, Accounting, MS-Office and Programming.",                       og_image: "", keywords: ["SIIT courses","OS-CIT","Tally GST","Photoshop"] },
  { id: "seo-about",   page: "about",   title: "About SIIT — 15 Years of Excellence in IT Education",            description: "Learn about SIIT's journey, mission, faculty and student success stories.",                                      og_image: "", keywords: ["about SIIT","IT education Odisha"] },
  { id: "seo-blog",    page: "blog",    title: "Blog — SIIT | Career Tips, Tutorials and Placement Stories",     description: "Guides, tutorials and career stories from the SIIT team.",                                                      og_image: "", keywords: ["SIIT blog","IT career tips","Tally tutorial"] },
  { id: "seo-events",  page: "events",  title: "Events — SIIT | Workshops, Orientations and Seminars",           description: "Stay updated on SIIT workshops, batch orientations and campus events.",                                         og_image: "", keywords: ["SIIT events","computer workshop Sorada"] },
  { id: "seo-contact", page: "contact", title: "Contact SIIT — Sorada, Ganjam, Odisha | +91 7873987123",         description: "Get in touch with SIIT. Visit us at Sorada, Ganjam or call +91 7873987123.",                                     og_image: "", keywords: ["contact SIIT","SIIT Sorada address"] },
];
