import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { FaUsers, FaBook, FaCalendarAlt, FaNewspaper, FaChalkboardTeacher, FaEye, FaEnvelope } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

import { blogService, eventService, siteSettingsService } from "../../services/db";
import { studentService, courseManagementService, teacherService } from "../../services/erpDb";
import { leadService } from "../../services/growthDb";

/**
 * SIIT — AdminDashboard
 * Overview: LIVE stats from service layer, bar chart, recent blogs + events.
 * Stats update as admin adds/removes students, courses, teachers.
 */

const GROWTH = [
  { month: "Jan", students: 42 }, { month: "Feb", students: 67 },
  { month: "Mar", students: 58 }, { month: "Apr", students: 85 },
  { month: "May", students: 74 }, { month: "Jun", students: 0 },
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState([]);
  const [growth, setGrowth] = useState(GROWTH);

  const { pathname } = useLocation();

  useEffect(() => {
    (async () => {
      const [b, e, stuStats, crsStats, teachers, siteStats, leadStats] = await Promise.all([
        blogService.list(),
        eventService.list(),
        studentService.stats(),
        courseManagementService.stats(),
        teacherService.list(),
        siteSettingsService.list(),
        leadService.stats(),
      ]);
      setBlogs(b.slice(0, 5));
      setEvents(e.slice(0, 5));

      const pageVisits = siteStats.find((s) => s.key === "page_visits")?.value || 0;
      const enquiries = siteStats.find((s) => s.key === "enquiries")?.value || leadStats.total;

      setStats([
        { label: "Students",    value: String(stuStats.total),  icon: FaUsers,              color: "#1c3fbd", to: "/admin/students" },
        { label: "Courses",     value: String(crsStats.total),  icon: FaBook,               color: "#eb0249", to: "/admin/courses" },
        { label: "Teachers",    value: String(teachers.length), icon: FaChalkboardTeacher,  color: "#f18032", to: "/admin/teachers" },
        { label: "Blog Posts",  value: String(b.length),        icon: FaNewspaper,          color: "#1DA1F2", to: "/admin/blogs" },
        { label: "Page Visits", value: String(pageVisits),      icon: FaEye,                color: "#8b5cf6", to: "/admin/analytics" },
        { label: "Enquiries",   value: String(enquiries),       icon: FaEnvelope,           color: "#10b981", to: "/admin/leads" },
      ]);
      setGrowth((g) => g.map((m, i) => i === g.length - 1 ? { ...m, students: stuStats.total } : m));
    })();
  }, [pathname]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium">Dashboard Overview</h1>

      {/* stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <div className="flex items-center justify-between rounded-2xl bg-white p-4 transition hover:shadow-md">
              <div>
                <div className="text-3xl font-medium" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm text-text_color2">{s.label}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${s.color}14` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* chart */}
      <div className="mb-6 rounded-2xl bg-white p-5">
        <h2 className="mb-4 font-medium">Student Growth (2026)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={growth} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "#f0f4ff" }} />
            <Bar dataKey="students" fill="#1c3fbd" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* recent blogs */}
        <div className="rounded-2xl bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Recent Blogs</h2>
            <Link to="/admin/blogs" className="text-xs text-[#1c3fbd] hover:underline">View all</Link>
          </div>
          {blogs.map((b) => (
            <div key={b.id} className="flex items-center gap-3 border-b border-grey py-2.5 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{b.title}</div>
                <div className="text-xs text-dark-grey">{b.category} · {fmtDate(b.publish_at)}</div>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                {b.status}
              </span>
            </div>
          ))}
        </div>

        {/* upcoming events */}
        <div className="rounded-2xl bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Upcoming Events</h2>
            <Link to="/admin/events" className="text-xs text-[#1c3fbd] hover:underline">View all</Link>
          </div>
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-3 border-b border-grey py-2.5 last:border-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-buttons_2/10">
                <FaCalendarAlt size={14} className="text-buttons_2" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{e.title}</div>
                <div className="text-xs text-dark-grey">{fmtDate(e.starts_at)}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                e.registration_open ? "bg-green-100 text-green-700" : "bg-grey text-dark-grey"
              }`}>
                {e.registration_open ? "Open" : "Closed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
