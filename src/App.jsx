import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { createContext, lazy, Suspense, useEffect, useMemo, useState } from "react";

import Navbar  from "./components/Navbar.component";
import Footer  from "./components/Footer.component";
import Loader  from "./components/Loader";
import { lookInSession }    from "./common/session";
import { AuthProvider, RequireRole } from "./context/AuthProvider";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import Popup           from "./components/layout/Popup";
import EnrolePopup      from "./components/EnrolePopup";
import { notificationService } from "./services/db";

/* ── Public ──────────────────────────────────────────────── */
const Home       = lazy(() => import("./pages/Home.page"));
const About      = lazy(() => import("./pages/About.page"));
const Courses    = lazy(() => import("./pages/Courses.page"));
const Contact    = lazy(() => import("./pages/Contact.page"));
const Blog       = lazy(() => import("./pages/Blog.page"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.page"));
const Events     = lazy(() => import("./pages/Events.page"));
const Gallery    = lazy(() => import("./pages/Gallery.page"));
const Quiz       = lazy(() => import("./pages/Quiz.page"));

/* ── Auth ────────────────────────────────────────────────── */
const UserAuthForm = lazy(() => import("./pages/UserAuthForm"));
const AuthCheck = lazy(() => import("./pages/AuthCheck"));

/* ── Admin ───────────────────────────────────────────────── */
const AdminLayout        = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard     = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBlogs         = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminEvents        = lazy(() => import("./pages/admin/AdminEvents"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminGallery       = lazy(() => import("./pages/admin/AdminGallery"));
const AdminTestimonials  = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminStudents      = lazy(() => import("./pages/admin/AdminStudents"));
const AdminTeachers      = lazy(() => import("./pages/admin/AdminTeachers"));
const AdminCourses       = lazy(() => import("./pages/admin/AdminCourses"));
const AdminAttendance    = lazy(() => import("./pages/admin/AdminAttendance"));
const AdminResults       = lazy(() => import("./pages/admin/AdminResults"));
const AdminLeads         = lazy(() => import("./pages/admin/AdminLeads"));
const AdminAnalytics     = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSEO           = lazy(() => import("./pages/admin/AdminSEO"));
const AdminSettings      = lazy(() => import("./pages/admin/AdminSettings"));
const AdminUsers         = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProfile       = lazy(() => import("./pages/admin/AdminProfile"));
const AdminNotes         = lazy(() => import("./pages/admin/AdminNotes"));
const AdminEnrollments   = lazy(() => import("./pages/admin/AdminEnrollments"));

/* ── Student Portal ──────────────────────────────────────── */
const StudentLayout    = lazy(() => import("./pages/student/StudentLayout"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentCourses    = lazy(() => import("./pages/student/StudentPages").then((m) => ({ default: m.StudentCourses })));
const StudentAttendance = lazy(() => import("./pages/student/StudentPages").then((m) => ({ default: m.StudentAttendance })));
const StudentResults    = lazy(() => import("./pages/student/StudentPages").then((m) => ({ default: m.StudentResults })));
const StudentNotes      = lazy(() => import("./pages/student/StudentPages").then((m) => ({ default: m.StudentNotes })));
const StudentProfile    = lazy(() => import("./pages/student/StudentPages").then((m) => ({ default: m.StudentProfile })));

export const UserContext = createContext({});

function App() {
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith("/admin");
  const [showPopup, setShowPopup] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [userAuth, setUserAuth]   = useState(() => {
    const u = lookInSession("user");
    return u ? JSON.parse(u) : { access_token: null };
  });
  const ctx = useMemo(() => ({ userAuth, setUserAuth, showPopup, setShowPopup }), [userAuth, showPopup]);

  // Fetch admin-managed notifications for the announcement bar.
  // Re-fetches whenever you move between the admin area and the public site,
  // so a notice you just added in the dashboard shows up without a page reload.
  useEffect(() => {
    notificationService.active().then((items) => {
      setAnnouncements(items.map((n) => ({
        id: n.id,
        type: n.type || "general",
        message: n.body || n.title,
        ctaLabel: n.cta_label || "",
        ctaHref: n.cta_href || "",
        active: true,
        startsAt: n.starts_at,
        endsAt: n.ends_at,
      })));
    });
  }, [inAdmin]);

  return (
    <UserContext.Provider value={ctx}>
      <AuthProvider>
        <AnnouncementBar announcements={announcements} />
        <Navbar />
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public */}
            <Route path="/"           element={<Home />} />
            <Route path="/about"      element={<About />} />
            <Route path="/courses"    element={<Courses />} />
            <Route path="/contact"    element={<Contact />} />
            <Route path="/blog"       element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/events"     element={<Events />} />
            <Route path="/gallery"    element={<Gallery />} />
            <Route path="/quiz"       element={<Quiz />} />
            {/* Auth */}
            <Route path="/signin" element={<UserAuthForm />} />
            <Route path="/signup" element={<Navigate to="/signin" replace />} />
            <Route path="/auth-check" element={<AuthCheck />} />
            {/* Admin */}
            <Route path="/admin" element={
              <RequireRole allow={["admin","super_admin"]}><AdminLayout /></RequireRole>
            }>
              <Route index              element={<AdminDashboard />} />
              <Route path="blogs"          element={<AdminBlogs />} />
              <Route path="events"         element={<AdminEvents />} />
              <Route path="notifications"  element={<AdminNotifications />} />
              <Route path="gallery"        element={<AdminGallery />} />
              <Route path="testimonials"   element={<AdminTestimonials />} />
              <Route path="students"       element={<AdminStudents />} />
              <Route path="teachers"       element={<AdminTeachers />} />
              <Route path="courses"        element={<AdminCourses />} />
              <Route path="attendance"     element={<AdminAttendance />} />
              <Route path="results"        element={<AdminResults />} />
              <Route path="leads"          element={<AdminLeads />} />
              <Route path="analytics"      element={<AdminAnalytics />} />
              <Route path="seo"            element={<AdminSEO />} />
              <Route path="settings"       element={<AdminSettings />} />
              <Route path="users"          element={<AdminUsers />} />
              <Route path="profile"        element={<AdminProfile />} />
              <Route path="notes"          element={<AdminNotes />} />
              <Route path="enrollments"    element={<AdminEnrollments />} />
            </Route>
            {/* Student Portal */}
            <Route path="/portal" element={
              <RequireRole allow={["student","teacher","admin","super_admin"]}>
                <StudentLayout />
              </RequireRole>
            }>
              <Route index               element={<StudentDashboard />} />
              <Route path="courses"      element={<StudentCourses />} />
              <Route path="attendance"   element={<StudentAttendance />} />
              <Route path="results"      element={<StudentResults />} />
              <Route path="notes"        element={<StudentNotes />} />
              <Route path="profile"      element={<StudentProfile />} />
            </Route>
          </Routes>
        </Suspense>
        <Footer />
        <Popup />
        {/* The enquiry form opens from Courses AND Events, so it lives here, once. */}
        {showPopup && <EnrolePopup />}
      </AuthProvider>
    </UserContext.Provider>
  );
}

export default App;
