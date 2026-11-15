import { useContext, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt, FaBook, FaCalendarCheck,
  FaAward, FaFileAlt, FaUserCircle, FaSignOutAlt, FaBars,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider";
import SiitLogo from "../../components/SiitLogo";
import { UserContext } from "../../App";

const NAV = [
  { to: "/portal",            label: "Dashboard",   Icon: FaTachometerAlt, end: true },
  { to: "/portal/courses",    label: "My Courses",  Icon: FaBook },
  { to: "/portal/attendance", label: "Attendance",   Icon: FaCalendarCheck },
  { to: "/portal/results",    label: "Results",      Icon: FaAward },
  { to: "/portal/notes",      label: "Notes",        Icon: FaFileAlt },
  { to: "/portal/profile",    label: "Profile",      Icon: FaUserCircle },
];

const StudentLayout = () => {
  const { user, signOut } = useAuth();
  const { setUserAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); setUserAuth({ access_token: null }); navigate("/signin", { replace: true }); };

  const sidebar = (
    <>
      <div className="border-b border-white/10 px-4 py-5">
        <SiitLogo size="md" tag="Student Portal" />
      </div>
      <nav className="flex-1 py-3">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "border-l-[3px] border-buttons_1 bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/[.08] hover:text-white"
              }`
            }
          >
            <Icon size={15} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-buttons_1 text-xs font-medium">
            {(user?.name?.[0] || "S").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium">{user?.name || "Student"}</div>
            <div className="truncate text-[10px] opacity-60">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white">
          <FaSignOutAlt size={12} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-body">
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden w-52 shrink-0 flex-col bg-[#1c2035] text-white md:flex"
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
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-[#1c2035] text-white md:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-grey bg-white px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-[#1b2447] hover:bg-body"
            aria-label="Open menu">
            <FaBars size={18} />
          </button>
          <SiitLogo size="sm" />
        </div>
        <main className="flex-1 overflow-auto p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
};

export default StudentLayout;
