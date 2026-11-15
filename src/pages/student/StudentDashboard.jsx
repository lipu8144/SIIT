import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBook, FaCalendarCheck, FaAward, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider";
import { resultService, attendanceService } from "../../services/erpDb";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";
import Reveal from "../../common/Reveal";

/**
 * SIIT — Student Dashboard (Phase 6)
 * Welcome card, course progress, recent attendance, latest result, quick links.
 * In dummy mode uses student "s1" (Raj Kishore Panda) as the demo session.
 * Student data is resolved per logged-in user via useCurrentStudent.
 */

const ProgressRing = ({ pct, color, size = 72 }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f4ff" strokeWidth={8} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ}
        animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fontSize="14" fontWeight="600" fill={color}>{pct}%</text>
    </svg>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { studentId } = useCurrentStudent();
  const [results, setResults]     = useState([]);
  const [attendance, setAttendance] = useState({ P: 0, A: 0, L: 0, rate: 0 });

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      const [res, att] = await Promise.all([
        resultService.forStudent(studentId),
        attendanceService.list(),
      ]);
      setResults(res);
      const mine = att.filter((r) => r.student_id === studentId);
      const P = mine.filter((r) => r.status === "P").length;
      const A = mine.filter((r) => r.status === "A").length;
      const L = mine.filter((r) => r.status === "L").length;
      const total = P + A + L;
      setAttendance({ P, A, L, rate: total ? Math.round((P / total) * 100) : 0 });
    })();
  }, [studentId]);

  const avgMarks = results.length
    ? Math.round(results.reduce((a, r) => a + (r.marks / r.max_marks) * 100, 0) / results.length)
    : 0;

  const QUICK = [
    { to: "/portal/courses",    label: "My Courses",  Icon: FaBook,          color: "#1c3fbd" },
    { to: "/portal/attendance", label: "Attendance",  Icon: FaCalendarCheck, color: "#f18032" },
    { to: "/portal/results",    label: "Results",     Icon: FaAward,         color: "#eb0249" },
  ];

  return (
    <div>
      {/* welcome */}
      <Reveal className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c3fbd] to-[#3457d6] p-6 text-white">
        <div className="text-sm opacity-80">Welcome back 👋</div>
        <h1 className="mt-1 text-2xl font-medium">{user?.name || "Student"}</h1>
        <p className="mt-1 text-sm opacity-80">Keep going — you're making great progress.</p>
      </Reveal>

      {/* stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Attendance",   node: <ProgressRing pct={attendance.rate} color="#1c3fbd" />, sub: `${attendance.P} present · ${attendance.A} absent` },
          { label: "Avg. Score",   node: <ProgressRing pct={avgMarks}        color="#eb0249" />, sub: `${results.length} subjects recorded` },
          { label: "Course Prog.", node: <ProgressRing pct={68}              color="#f18032" />, sub: "OS-CIT · 2 months left" },
        ].map((c) => (
          <Reveal key={c.label} className="flex flex-col items-center rounded-2xl bg-white py-5 px-3 text-center">
            {c.node}
            <div className="mt-2 text-sm font-medium">{c.label}</div>
            <div className="text-xs text-dark-grey">{c.sub}</div>
          </Reveal>
        ))}
      </div>

      {/* quick links */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK.map(({ to, label, Icon, color }, i) => (
          <Reveal key={to} index={i}>
            <Link to={to} className="flex items-center justify-between rounded-2xl bg-white p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}14` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
              <FaArrowRight size={12} className="text-dark-grey" />
            </Link>
          </Reveal>
        ))}
      </div>

      {/* latest results */}
      {results.length > 0 && (
        <Reveal className="rounded-2xl bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Recent Results</h2>
            <Link to="/portal/results" className="text-xs text-[#1c3fbd] hover:underline">View all</Link>
          </div>
          {results.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center justify-between border-b border-grey py-2.5 last:border-0">
              <div>
                <div className="text-sm font-medium">{r.subject}</div>
                <div className="text-xs text-dark-grey">{r.course_name}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{r.marks}/{r.max_marks}</span>
                <span className="rounded-full bg-[#1c3fbd]/10 px-2.5 py-0.5 text-xs font-bold text-[#1c3fbd]">{r.grade}</span>
              </div>
            </div>
          ))}
        </Reveal>
      )}
    </div>
  );
};

export default StudentDashboard;
