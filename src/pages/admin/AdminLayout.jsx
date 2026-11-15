import { useContext, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt, FaUsers, FaChalkboardTeacher, FaBook,
  FaCalendarAlt, FaNewspaper, FaBell, FaImages, FaStar,
  FaCalendarCheck, FaAward, FaUserTie, FaChartLine, FaSearch,
  FaCog, FaSignOutAlt, FaBars, FaTimes, FaUserGraduate, FaFileAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider";
import SiitLogo from "../../components/SiitLogo";
import { UserContext } from "../../App";

const NAV = [
  { to: "/admin",              label: "Dashboard",      Icon: FaTachometerAlt, end: true },
  { heading: "Content" },
  { to: "/admin/blogs",        label: "Blogs",          Icon: FaNewspaper },
  { to: "/admin/events",       label: "Events",         Icon: FaCalendarAlt },
  { to: "/admin/notifications",label: "Notifications",  Icon: FaBell },
  { to: "/admin/gallery",      label: "Gallery",        Icon: FaImages },
  { to: "/admin/testimonials", label: "Testimonials",   Icon: FaStar },
  { heading: "ERP" },
  { to: "/admin/students",     label: "Students",       Icon: FaUsers },
  { to: "/admin/teachers",     label: "Teachers",       Icon: FaChalkboardTeacher },
  { to: "/admin/courses",      label: "Courses",        Icon: FaBook },
  { to: "/admin/attendance",   label: "Attendance",     Icon: FaCalendarCheck },
  { to: "/admin/results",      label: "Results",        Icon: FaAward },
  { to: "/admin/enrollments",  label: "Enrollments",    Icon: FaUserGraduate },
  { to: "/admin/notes",        label: "Notes & Material",Icon: FaFileAlt },
  { heading: "Growth" },
  { to: "/admin/leads",        label: "Leads CRM",      Icon: FaUserTie },
  { to: "/admin/analytics",    label: "Analytics",      Icon: FaChartLine },
  { to: "/admin/seo",          label: "SEO",            Icon: FaSearch },
  { heading: "System" },
  { to: "/admin/users",       label: "Users & Roles", Icon: FaUsers },
  { to: "/admin/settings",    label: "Site Settings",  Icon: FaCog },
];

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const { setUserAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserAuth({ access_token: null });
    navigate("/signin", { replace: true });
  };

  const sidebar = (
    <>
      {/* logo */}
      <div className="border-b border-white/10 px-4 py-5">
        <SiitLogo size="md" tag="Admin" />
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((item, i) =>
          item.heading ? (
            <div key={i} className="mt-4 mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {item.heading}
            </div>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-l-[3px] border-buttons_1 bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/[.08] hover:text-white"
                }`
              }
            >
              <item.Icon size={14} /> {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* user + sign out */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c3fbd] text-xs font-medium">
            {(user?.name?.[0] || "A").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium">{user?.name || "Admin"}</div>
            <div className="truncate text-[10px] opacity-60">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white">
          <FaSignOutAlt size={12} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f0f4ff]">
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden w-56 shrink-0 flex-col bg-[#1c2035] text-white md:flex"
      >
        {sidebar}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1c2035] text-white md:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-grey bg-white px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-[#1b2447] hover:bg-body"
            aria-label="Open menu">
            <FaBars size={18} />
          </button>
          <SiitLogo size="sm" tag="Admin" />
        </div>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
