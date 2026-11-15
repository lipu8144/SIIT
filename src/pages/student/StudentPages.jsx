/* ════════════════════════════════════════════════════════════
   SIIT — Student Portal Pages (Phase 6)
   Five pages in one file for efficiency:
     StudentCourses · StudentAttendance · StudentResults
     StudentNotes   · StudentProfile
   Each is exported as a named + default export.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaDownload, FaCheckCircle, FaTimesCircle, FaClock,
  FaBook, FaFilePdf, FaVideo, FaFileAlt, FaEdit, FaSave,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthProvider";
import { resultService, attendanceService, courseManagementService, studentService, noteService, enrollmentService } from "../../services/erpDb";
import ChangePassword from "../../components/ChangePassword";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";
import Reveal from "../../common/Reveal";


/* ── helpers ─────────────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const FIELD = "w-full rounded-lg border border-[#1c3fbd]/20 bg-body px-3 py-2.5 text-sm outline-none transition focus:border-[#1c3fbd] focus:ring-1 focus:ring-[#1c3fbd]/20";

/* ── DUMMY NOTES (replace with Supabase `notes` table) ────── */
const DUMMY_NOTES = [
  { id: "n1", title: "Computer Fundamentals — Chapter 1", type: "pdf",   url: null, course: "OS-CIT",         date: "2026-05-10" },
  { id: "n2", title: "MS-Office Shortcuts Reference",     type: "pdf",   url: null, course: "OS-CIT",         date: "2026-05-15" },
  { id: "n3", title: "Tally Data Entry Practice File",    type: "pdf",   url: null, course: "Tally with GST", date: "2026-05-20" },
  { id: "n4", title: "Excel VLOOKUP Tutorial",            type: "video", url: null, course: "Advanced Excel", date: "2026-06-01" },
  { id: "n5", title: "Assignment — Balance Sheet",        type: "assign",url: null, course: "Tally with GST", date: "2026-06-05" },
];

const TYPE_ICON = { pdf: FaFilePdf, video: FaVideo, assign: FaFileAlt };
const TYPE_COLOR = { pdf: "#eb0249", video: "#1DA1F2", assign: "#f18032" };

/* ══════════════════════════════════════════════════════════
   1. My Courses
   ══════════════════════════════════════════════════════════ */
export const StudentCourses = () => {
  const { studentId } = useCurrentStudent();
  const [enrolled, setEnrolled] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    if (!studentId) return;
    // Real enrollments drive this list — assigned in Admin > Enrollments
    enrollmentService.forStudent(studentId).then((rows) => {
      setEnrolled(rows.map((r) => r.course).filter(Boolean));
      const pm = {};
      rows.forEach((r) => { if (r.course) pm[r.course.id] = r.progress ?? 0; });
      setProgressMap(pm);
    });
  }, [studentId]);

  const DEFAULT_MODULES = ["Introduction", "Core Concepts", "Practical Lab", "Project Work", "Revision", "Final Assessment"];
  const MODULES = {
    "mc1": ["Computer Basics","MS-Word","MS-Excel","MS-PowerPoint","Internet & Email","OS-CIT Exam Prep"],
    "mc4": ["Tally Interface","Voucher Entry","Bank Reconciliation","GST Configuration","Reports","Final Assessment"],
  };
  const modulesFor  = (id) => MODULES[id] || DEFAULT_MODULES;
  const progressFor = (id) => progressMap[id] ?? 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium">My <span className="text-buttons_1">Courses</span></h1>
      <div className="grid gap-5 md:grid-cols-2">
        {enrolled.map((course, i) => (
          <Reveal key={course.id} index={i} className="overflow-hidden rounded-2xl bg-white">
            <div className="h-2 w-full bg-gradient-to-r from-[#1c3fbd] to-buttons_1" />
            <div className="p-5">
              <div className="mb-1 text-xs font-medium text-[#1c3fbd]">{course.category}</div>
              <h2 className="mb-3 text-lg font-bold">{course.name}</h2>
              {/* progress */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs text-dark-grey">
                  <span>Progress</span><span className="font-medium">{progressFor(course.id)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-grey">
                  <motion.div className="h-full rounded-full bg-[#1c3fbd]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressFor(course.id)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              {/* modules */}
              <div className="flex flex-col gap-1.5">
                {modulesFor(course.id).map((mod, j) => {
                  const done = j < Math.floor((modulesFor(course.id).length * progressFor(course.id)) / 100);
                  return (
                    <div key={mod} className="flex items-center gap-2 text-sm">
                      {done
                        ? <FaCheckCircle size={13} className="flex-shrink-0 text-green-500" />
                        : <div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-grey" />}
                      <span className={done ? "text-text_color1" : "text-dark-grey"}>{mod}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2 text-xs text-dark-grey">
                <span>{course.duration_months} months</span>
                <span>·</span>
                <span>Batch {course.name === "OS-CIT" ? "A 2024" : "A 2024"}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   2. Attendance
   ══════════════════════════════════════════════════════════ */
export const StudentAttendance = () => {
  const { studentId } = useCurrentStudent();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ P: 0, A: 0, L: 0, rate: 0 });

  useEffect(() => {
    if (!studentId) return;
    attendanceService.list().then((all) => {
      const mine = all.filter((r) => r.student_id === studentId);
      setRecords(mine);
      const P = mine.filter((r) => r.status === "P").length;
      const A = mine.filter((r) => r.status === "A").length;
      const L = mine.filter((r) => r.status === "L").length;
      const total = P + A + L;
      setSummary({ P, A, L, rate: total ? Math.round((P / total) * 100) : 0 });
    });
  }, [studentId]);

  const StatusIcon = ({ s }) => ({
    P: <FaCheckCircle className="text-green-500" />,
    A: <FaTimesCircle className="text-buttons_1" />,
    L: <FaClock className="text-buttons_2" />,
  }[s] || null);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium">My <span className="text-buttons_1">Attendance</span></h1>
      {/* summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Present", val: summary.P,    color: "text-green-600"  },
          { label: "Absent",  val: summary.A,    color: "text-buttons_1"  },
          { label: "Late",    val: summary.L,    color: "text-buttons_2"  },
          { label: "Rate",    val: `${summary.rate}%`, color: summary.rate >= 75 ? "text-green-600" : "text-buttons_1" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 text-center">
            <div className={`text-2xl font-medium ${s.color}`}>{s.val}</div>
            <div className="text-xs text-dark-grey">{s.label}</div>
          </div>
        ))}
      </div>
      {summary.rate < 75 && (
        <div className="mb-5 rounded-xl bg-buttons_1/10 px-4 py-3 text-sm text-buttons_1">
          ⚠️ Your attendance is below 75%. Minimum 75% required for certification.
        </div>
      )}
      {/* records table */}
      <div className="overflow-hidden rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grey bg-body text-xs uppercase tracking-wide text-dark-grey">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={2} className="py-10 text-center text-dark-grey">No records found.</td></tr>
            ) : (
              records.slice().reverse().map((r) => (
                <tr key={r.id} className="border-b border-grey/50 hover:bg-body/50">
                  <td className="px-4 py-3">{fmtDate(r.date)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <StatusIcon s={r.status} />
                      {{ P: "Present", A: "Absent", L: "Late" }[r.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   3. Results
   ══════════════════════════════════════════════════════════ */
export const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [rc, setRc] = useState(null);
  const { studentId } = useCurrentStudent();

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      const [res, reportCard] = await Promise.all([
        resultService.forStudent(studentId),
        resultService.reportCard(studentId),
      ]);
      setResults(res.filter((r) => r.published));
      setRc(reportCard);
    })();
  }, [studentId]);

  const handleDownload = () => {
    if (!rc) return;
    const rows = rc.subjects.map((s) => `${s.subject},${s.marks},${s.max_marks},${s.grade}`).join("\n");
    const csv = `SIIT Report Card\nStudent,${rc.student.name}\nCourse,${rc.student.course_name}\n\nSubject,Marks,Max,Grade\n${rows}\n\nAverage,${rc.average}%\nOverall Grade,${rc.grade}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `SIIT_ReportCard_${rc.student.name.replace(/ /g,"_")}.csv`; a.click();
    toast.success("Report card downloaded");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">My <span className="text-buttons_1">Results</span></h1>
        {rc && (
          <button onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-full bg-[#1c3fbd] px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <FaDownload size={12} /> Download Report Card
          </button>
        )}
      </div>

      {/* overall */}
      {rc && (
        <Reveal className="mb-5 flex items-center justify-between rounded-2xl bg-white p-5">
          <div>
            <div className="text-sm text-dark-grey">Overall Average</div>
            <div className="text-3xl font-bold text-[#1c3fbd]">{rc.average}%</div>
          </div>
          <div className="rounded-full bg-buttons_1 px-5 py-2 text-2xl font-bold text-white">{rc.grade}</div>
        </Reveal>
      )}

      {/* subject table */}
      <div className="overflow-hidden rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grey bg-body text-xs uppercase tracking-wide text-dark-grey">
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-right">Marks</th>
              <th className="px-4 py-3 text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-dark-grey">No published results yet.</td></tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="border-b border-grey/50 hover:bg-body/50">
                  <td className="px-4 py-3 font-medium">{r.subject}</td>
                  <td className="px-4 py-3 text-dark-grey">{r.course_name}</td>
                  <td className="px-4 py-3 text-right">{r.marks}/{r.max_marks}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#1c3fbd]">{r.grade}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   4. Notes & Assignments
   ══════════════════════════════════════════════════════════ */
export const StudentNotes = () => {
  const [filter, setFilter] = useState("All");
  const [notes, setNotes] = useState([]);
  const types = ["All", "pdf", "video", "assign"];

  useEffect(() => {
    // Only published material is returned to students
    noteService.published().then(setNotes);
  }, []);

  const filtered = filter === "All" ? notes : notes.filter((n) => n.type === filter);

  const handleDownload = (note) => {
    if (note.url) { window.open(note.url, "_blank"); return; }
    toast.success(`"${note.title}" — file will open when connected to storage`);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium">Notes & <span className="text-buttons_1">Assignments</span></h1>
      <div className="mb-4 flex gap-2 flex-wrap">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all ${
              filter === t ? "border-[#1c3fbd] bg-[#1c3fbd] text-white" : "border-[#1c3fbd]/20 bg-white text-[#1c3fbd]"
            }`}
          >
            {t === "assign" ? "Assignments" : t === "All" ? "All" : t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((note, i) => {
          const Icon  = TYPE_ICON[note.type]  || FaFileAlt;
          const color = TYPE_COLOR[note.type] || "#42506a";
          return (
            <Reveal key={note.id} index={i}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}14` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{note.title}</div>
                <div className="text-xs text-dark-grey">{note.course} · {note.date}</div>
              </div>
              <button onClick={() => handleDownload(note)}
                className="flex-shrink-0 rounded-lg p-2 text-[#1c3fbd] hover:bg-[#1c3fbd]/10"
                aria-label="Download"
              >
                <FaDownload size={14} />
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   5. Profile
   ══════════════════════════════════════════════════════════ */
export const StudentProfile = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  const { studentId } = useCurrentStudent();

  useEffect(() => {
    if (!studentId) return;
    studentService.getById(studentId).then((data) => {
      const d = data || {};
      setStudentData(d);
      setForm({
        name:    d.name    || user?.name || "",
        email:   d.email   || user?.email || "",
        phone:   d.phone   || "",
        address: d.address || "",
      });
    });
  }, [studentId]);

  const handleSave = async () => {
    if (!studentId) { toast.error("No student record linked to your account."); return; }
    await studentService.update(studentId, form);
    setStudentData((prev) => ({ ...prev, ...form }));
    toast.success("Profile updated");
    setEditing(false);
  };

  const Field = ({ label, field }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-dark-grey">{label}</label>
      {editing
        ? <input className={FIELD} value={form[field]}
            onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
        : <div className="rounded-lg bg-body px-3 py-2.5 text-sm">{form[field] || "—"}</div>}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">My <span className="text-buttons_1">Profile</span></h1>
        {editing
          ? <button onClick={handleSave} className="btn-dark inline-flex items-center gap-2 text-sm"><FaSave size={12} /> Save</button>
          : <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-full border border-[#1c3fbd]/25 bg-white px-4 py-2 text-sm font-medium text-[#1c3fbd]"><FaEdit size={12} /> Edit</button>
        }
      </div>

      <div className="rounded-2xl bg-white p-6">
        {/* avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1c3fbd] text-3xl font-bold text-white">
            {form.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <div className="text-xl font-bold">{form.name}</div>
            <div className="text-sm text-dark-grey">{studentData.enrollment_no}</div>
            <div className="mt-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 inline-block">
              {studentData.status || "active"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name"    field="name"    />
          <Field label="Email"        field="email"   />
          <Field label="Phone"        field="phone"   />
          <Field label="Address"      field="address" />
          <div>
            <label className="mb-1 block text-xs font-medium text-dark-grey">Course</label>
            <div className="rounded-lg bg-body px-3 py-2.5 text-sm">{studentData.course_name}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-dark-grey">Batch</label>
            <div className="rounded-lg bg-body px-3 py-2.5 text-sm">{studentData.batch}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-dark-grey">Joined</label>
            <div className="rounded-lg bg-body px-3 py-2.5 text-sm">{studentData.joined_at}</div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-dark-grey">Enrollment No.</label>
            <div className="rounded-lg bg-body px-3 py-2.5 text-sm">{studentData.enrollment_no}</div>
          </div>
        </div>
      </div>

      <ChangePassword />
    </div>
  );
};

/* No default export — all five pages are named exports.
   App.jsx wraps each with React.lazy's .then(m => ({ default: m.X })). */
