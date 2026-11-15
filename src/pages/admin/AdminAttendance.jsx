import { errText } from "../../lib/errors";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaCheck } from "react-icons/fa";

import Reveal from "../../common/Reveal";
import { attendanceService, studentService } from "../../services/erpDb";

/**
 * SIIT — Admin: Attendance (Phase 4)
 * Two tabs:
 *   1. Mark Attendance — date picker → P/A/L buttons per student → bulk save.
 *   2. Monthly Report — aggregated present/absent/late/rate per student.
 */

const STATUS_CFG = {
  P: { label: "P", bg: "bg-[#1c3fbd]/10 text-[#1c3fbd]", active: "bg-[#1c3fbd] text-white" },
  A: { label: "A", bg: "bg-buttons_1/10 text-buttons_1",  active: "bg-buttons_1 text-white" },
  L: { label: "L", bg: "bg-buttons_2/10 text-buttons_2",  active: "bg-buttons_2 text-white" },
};

const today = new Date().toISOString().split("T")[0];

const AdminAttendance = () => {
  const [tab, setTab] = useState("mark");

  /* ── Mark tab state ── */
  const [date, setDate]         = useState(today);
  const [students, setStudents] = useState([]);
  const [marks, setMarks]       = useState({});      // { student_id: "P"|"A"|"L"|null }
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  /* ── Monthly tab state ── */
  const [year]        = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthly, setMonthly] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await studentService.list({ status: "active" });
      setStudents(all);
      // Pre-fill any existing marks for today
      const existing = await attendanceService.forDate(date);
      const m = {};
      existing.forEach((r) => { m[r.student_id] = r.status; });
      setMarks(m);
    })();
  }, []);

  // Reload existing marks when date changes
  useEffect(() => {
    setSaved(false);
    attendanceService.forDate(date).then((existing) => {
      const m = {};
      existing.forEach((r) => { m[r.student_id] = r.status; });
      setMarks(m);
    });
  }, [date]);

  // Load monthly when tab or month changes
  useEffect(() => {
    if (tab !== "monthly") return;
    setLoadingMonthly(true);
    attendanceService.monthlySummary(year, month)
      .then(setMonthly)
      .finally(() => setLoadingMonthly(false));
  }, [tab, year, month]);

  const toggle = (sid, status) => {
    setMarks((m) => ({ ...m, [sid]: m[sid] === status ? null : status }));
    setSaved(false);
  };

  const summary = useMemo(() => {
    const vals = Object.values(marks);
    return { P: vals.filter((v) => v === "P").length, A: vals.filter((v) => v === "A").length, L: vals.filter((v) => v === "L").length };
  }, [marks]);

  const handleSave = async () => {
    const records = students
      .map((s) => ({ student_id: s.id, student_name: s.name, date, status: marks[s.id] || "A" }))
      .filter((r) => r.status);
    if (!records.length) { toast.error("Mark at least one student"); return; }
    setSaving(true);
    try {
      await attendanceService.bulkSave(records);
      toast.success("Attendance saved");
      setSaved(true);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Attendance</h1>
        <div className="flex gap-2">
          {["mark", "monthly"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                tab === t ? "border-[#1c3fbd] bg-[#1c3fbd] text-white" : "border-[#1c3fbd]/20 bg-white text-[#1c3fbd]"
              }`}
            >{t === "mark" ? "Mark Attendance" : "Monthly Report"}</button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "mark" && (
          <motion.div key="mark" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* date picker + summary */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm">
                <FaCalendarAlt className="text-[#1c3fbd]" />
                <input type="date" value={date} max={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-sm outline-none" />
              </div>
              {["P", "A", "L"].map((s) => (
                <div key={s} className="rounded-xl bg-white px-5 py-2 text-center shadow-sm">
                  <div className={`text-2xl font-medium ${s === "P" ? "text-[#1c3fbd]" : s === "A" ? "text-buttons_1" : "text-buttons_2"}`}>
                    {summary[s]}
                  </div>
                  <div className="text-xs text-text_color2">{s === "P" ? "Present" : s === "A" ? "Absent" : "Late"}</div>
                </div>
              ))}
            </div>

            {/* student list */}
            <div className="overflow-x-auto rounded-2xl bg-white">
              <div className="grid grid-cols-[1fr_auto] border-b border-grey bg-body px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-dark-grey">
                <span>Student</span><span>Mark</span>
              </div>
              {students.map((s, i) => (
                <Reveal key={s.id} index={i}
                  className="flex items-center justify-between border-b border-grey/50 px-4 py-3 last:border-0 hover:bg-body/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1c3fbd]/10 text-xs font-medium text-[#1c3fbd]">
                      {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-text_color2">{s.course_name} · {s.batch}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {["P", "A", "L"].map((st) => (
                      <button key={st} onClick={() => toggle(s.id, st)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          marks[s.id] === st ? STATUS_CFG[st].active : STATUS_CFG[st].bg
                        }`}
                      >{STATUS_CFG[st].label}</button>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={handleSave} disabled={saving}
                className="btn-dark inline-flex items-center gap-2 text-sm disabled:opacity-60"
              >
                {saving ? "Saving…" : saved ? <><FaCheck size={12} /> Saved</> : "Save Attendance"}
              </button>
              <span className="text-xs text-text_color2">
                {Object.values(marks).filter(Boolean).length} of {students.length} marked
              </span>
            </div>
          </motion.div>
        )}

        {tab === "monthly" && (
          <motion.div key="monthly" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-4 flex items-center gap-3">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-xl border border-[#1c3fbd]/20 bg-white px-3 py-2 text-sm outline-none">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString("en-IN", { month: "long" })}
                  </option>
                ))}
              </select>
              <span className="text-sm text-text_color2">{year}</span>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-grey bg-body text-xs uppercase tracking-wide text-dark-grey">
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-center">Present</th>
                    <th className="px-4 py-3 text-center">Absent</th>
                    <th className="px-4 py-3 text-center">Late</th>
                    <th className="px-4 py-3 text-center">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMonthly ? (
                    <tr><td colSpan={5} className="py-10 text-center text-dark-grey">Loading…</td></tr>
                  ) : monthly.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-dark-grey">No attendance records for this month.</td></tr>
                  ) : (
                    monthly.map((r) => (
                      <tr key={r.student_id} className="border-b border-grey/50 hover:bg-body/50">
                        <td className="px-4 py-3 font-medium">{r.student_name}</td>
                        <td className="px-4 py-3 text-center text-[#1c3fbd]">{r.present}</td>
                        <td className="px-4 py-3 text-center text-buttons_1">{r.absent}</td>
                        <td className="px-4 py-3 text-center text-buttons_2">{r.late}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${r.rate >= 75 ? "text-green-600" : "text-buttons_1"}`}>
                            {r.rate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAttendance;
