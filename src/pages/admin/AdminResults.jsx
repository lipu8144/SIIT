import { errText } from "../../lib/errors";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { resultService, studentService, courseManagementService } from "../../services/erpDb";

/**
 * SIIT — Admin: Results (Phase 4)
 * Add marks per student + subject, auto-calculate grade,
 * publish/unpublish, view report card panel.
 */

const autoGrade = (marks, max) => {
  const pct = (marks / max) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  return "C";
};

const BLANK = {
  student_id: "s1", course_id: "c1", subject: "",
  marks: "", max_marks: 100, published: false,
};

const AdminResults = () => {
  const [rows, setRows]         = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allCourses, setAllCourses]   = useState([]);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [reportCard, setReportCard] = useState(null);
  const form = useRef({});

  useEffect(() => {
    Promise.all([
      resultService.list(),
      studentService.list(),
      courseManagementService.list(),
    ]).then(([r, s, c]) => { setRows(r); setAllStudents(s); setAllCourses(c); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const marks    = Number(form.current.marks?.value)     || 0;
    const max      = Number(form.current.max_marks?.value) || 100;
    const sid      = form.current.student_id?.value;
    const cid      = form.current.course_id?.value;
    const student  = allStudents.find((s) => s.id === sid);
    const course   = allCourses.find((c) => c.id === cid);
    const data = {
      student_id:   sid,
      student_name: student?.name || "",
      course_id:    cid,
      course_name:  course?.name || "",
      subject:      form.current.subject?.value || "",
      marks,
      max_marks:    max,
      grade:        autoGrade(marks, max),
      published:    form.current.published?.checked || false,
    };
    setSaving(true);
    try {
      if (editing) {
        const u = await resultService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Result updated");
      } else {
        const c = await resultService.create(data);
        setRows((r) => [c, ...r]);
        toast.success("Result added");
      }
      setModal(false);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await resultService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Result deleted");
  };

  const handlePublish = async (id, current) => {
    const u = await resultService.update(id, { published: !current });
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...u } : x)));
    toast.success(current ? "Unpublished" : "Published");
  };

  const viewReportCard = async (studentId) => {
    const rc = await resultService.reportCard(studentId);
    setReportCard(rc);
  };

  const cols = [
    { key: "student_name", label: "Student",  render: (v) => <span className="font-medium">{v}</span> },
    { key: "course_name",  label: "Course" },
    { key: "subject",      label: "Subject" },
    { key: "marks",        label: "Marks",    render: (v, r) => `${v} / ${r.max_marks}` },
    { key: "grade",        label: "Grade",    render: (v) => <span className="font-bold text-[#1c3fbd]">{v}</span> },
    { key: "published",    label: "Published",render: (v, row) => (
        <button onClick={() => handlePublish(row.id, v)}
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
            v ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-grey text-dark-grey hover:bg-grey"
          }`}
        >
          {v ? <><FaCheck size={9} /> Published</> : "Draft"}
        </button>
      )},
  ];

  const cur = editing || BLANK;

  return (
    <>
      <CrudTable title="Results" columns={cols} rows={rows}
        onAdd={() => { setEditing(null); setModal(true); }}
        onEdit={(r) => { setEditing(r); setModal(true); }}
        onDelete={handleDelete}
        searchKeys={["student_name", "course_name", "subject"]}
        addLabel="Add Result"
      />

      {/* per-student report card button */}
      <div className="mt-4 rounded-2xl bg-white p-4">
        <h2 className="mb-3 font-medium text-sm">View Report Card</h2>
        <div className="flex flex-wrap gap-2">
          {allStudents.map((s) => (
            <button key={s.id} onClick={() => viewReportCard(s.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1c3fbd]/20 bg-body px-3 py-1.5 text-xs font-medium text-[#1c3fbd] hover:bg-[#1c3fbd]/10"
            >
              <FaEye size={11} /> {s.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* add/edit modal */}
      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)}
        title={editing ? "Edit Result" : "Add Result"}
        onSubmit={handleSubmit} loading={saving}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Student" required>
            <select ref={(el) => (form.current.student_id = el)} defaultValue={cur.student_id} className={FIELD}>
              {allStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Course" required>
            <select ref={(el) => (form.current.course_id = el)} defaultValue={cur.course_id} className={FIELD}>
              {allCourses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Subject" required>
          <input ref={(el) => (form.current.subject = el)} defaultValue={cur.subject} className={FIELD} placeholder="e.g. Computer Fundamentals" required />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Marks Obtained">
            <input ref={(el) => (form.current.marks = el)} type="number" min="0" defaultValue={cur.marks} className={FIELD} />
          </FormField>
          <FormField label="Max Marks">
            <input ref={(el) => (form.current.max_marks = el)} type="number" min="1" defaultValue={cur.max_marks} className={FIELD} />
          </FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input ref={(el) => (form.current.published = el)} type="checkbox" defaultChecked={cur.published} className="accent-buttons_1" />
          Publish result immediately
        </label>
      </CrudModal>

      {/* report card panel */}
      <AnimatePresence>
        {reportCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReportCard(null)}
            className="fixed inset-0 z-50 flex overflow-y-auto bg-black/45 p-4"
          >
            <motion.div initial={{ scale: 0.94 }} animate={{ scale: 1 }} exit={{ scale: 0.94 }}
              onClick={(e) => e.stopPropagation()}
              className="m-auto w-full max-w-md overflow-hidden rounded-2xl bg-white"
            >
              {/* header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-[#1c3fbd] to-[#3457d6] p-5 text-white">
                <div>
                  <div className="text-xs opacity-80">SIIT — Report Card</div>
                  <div className="text-lg font-medium">{reportCard.student.name}</div>
                  <div className="text-sm opacity-85">{reportCard.student.course_name} · {reportCard.student.batch}</div>
                </div>
                <button onClick={() => setReportCard(null)} className="rounded-full bg-white/20 p-1.5 hover:bg-white/30"><FaTimes /></button>
              </div>
              {/* subjects */}
              <div className="p-5">
                <table className="mb-4 w-full text-sm">
                  <thead>
                    <tr className="border-b border-grey text-xs uppercase text-dark-grey">
                      <th className="pb-2 text-left">Subject</th>
                      <th className="pb-2 text-right">Marks</th>
                      <th className="pb-2 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportCard.subjects.map((s) => (
                      <tr key={s.id} className="border-b border-grey/50">
                        <td className="py-2">{s.subject}</td>
                        <td className="py-2 text-right">{s.marks}/{s.max_marks}</td>
                        <td className="py-2 text-right font-bold text-[#1c3fbd]">{s.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between rounded-xl bg-body p-4">
                  <div className="text-sm text-text_color2">Overall Average</div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#1c3fbd]">{reportCard.average}%</span>
                    <span className="rounded-full bg-buttons_1 px-3 py-1 text-sm font-bold text-white">{reportCard.grade}</span>
                  </div>
                </div>
                {/* enrollment details */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-text_color2">
                  <div><div className="font-medium text-black">{reportCard.student.enrollment_no}</div>Enroll #</div>
                  <div><div className="font-medium text-black">{reportCard.student.batch}</div>Batch</div>
                  <div><div className="font-medium text-black">{reportCard.student.joined_at}</div>Joined</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminResults;
