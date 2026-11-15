import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaUserGraduate, FaBook, FaCheckCircle } from "react-icons/fa";

import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { enrollmentService, studentService, courseManagementService } from "../../services/erpDb";

/**
 * SIIT — Admin: Enrollments
 * Assign students to courses. Drives the student portal's
 * "My Courses" tab and each course's enrolled count.
 */

const STATUSES = ["active", "completed", "dropped"];
const STATUS_BADGE = {
  active:    "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  dropped:   "bg-grey text-dark-grey",
};

const AdminEnrollments = () => {
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const form = useRef({});

  const load = async () => {
    const [e, s, c] = await Promise.all([
      enrollmentService.list(),
      studentService.list(),
      courseManagementService.list(),
    ]);
    setRows(e); setStudents(s); setCourses(c);
  };
  useEffect(() => { load(); }, []);

  const nameOf   = (id) => students.find((s) => s.id === id)?.name || "—";
  const courseOf = (id) => courses.find((c) => c.id === id)?.name || "—";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      student_id: form.current.student_id?.value || "",
      course_id:  form.current.course_id?.value || "",
      status:     form.current.status?.value || "active",
      progress:   Number(form.current.progress?.value) || 0,
    };
    if (!data.student_id || !data.course_id) {
      toast.error("Pick a student and a course");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await enrollmentService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)));
        toast.success("Enrollment updated");
      } else {
        const dup = rows.find((r) => r.student_id === data.student_id && r.course_id === data.course_id);
        if (dup) { toast.error("That student is already enrolled in this course"); setSaving(false); return; }
        const created = await enrollmentService.create({
          ...data,
          enrolled_at: new Date().toISOString().slice(0, 10),
        });
        setRows((r) => [created, ...r]);
        toast.success(`${nameOf(data.student_id)} enrolled in ${courseOf(data.course_id)}`);
      }
      setModal(false);
      // refresh course counts
      courseManagementService.list().then(setCourses);
    } catch (err) {
      toast.error(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await enrollmentService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Enrollment removed");
  };

  const cols = [
    { key: "student_id", label: "Student", render: (v) => <span className="font-medium">{nameOf(v)}</span> },
    { key: "course_id",  label: "Course",  render: (v) => courseOf(v) },
    {
      key: "progress", label: "Progress",
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-grey">
            <div className="h-full rounded-full bg-buttons_1" style={{ width: `${v || 0}%` }} />
          </div>
          <span className="text-xs text-dark-grey">{v || 0}%</span>
        </div>
      ),
    },
    {
      key: "status", label: "Status",
      render: (v) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[v] || ""}`}>{v}</span>
      ),
    },
  ];

  const cur = editing || { student_id: "", course_id: "", status: "active", progress: 0 };

  const stats = [
    { label: "Total Enrollments", value: rows.length, Icon: FaUserGraduate, color: "#1c3fbd" },
    { label: "Active",            value: rows.filter((r) => r.status === "active").length, Icon: FaBook, color: "#eb0249" },
    { label: "Completed",         value: rows.filter((r) => r.status === "completed").length, Icon: FaCheckCircle, color: "#f18032" },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-medium">Enrollments</h1>
        <p className="text-sm text-dark-grey">
          Assign students to courses. This drives their "My Courses" tab.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-2xl bg-white p-4">
            <div>
              <div className="text-2xl font-medium" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm text-text_color2">{s.label}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${s.color}14` }}>
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
          </div>
        ))}
      </div>

      <CrudTable
        title="Enrollments"
        columns={cols}
        rows={rows}
        onAdd={() => { setEditing(null); setModal(true); }}
        onEdit={(r) => { setEditing(r); setModal(true); }}
        onDelete={handleDelete}
        searchKeys={["status"]}
        addLabel="Enroll Student"
      />

      <CrudModal
        formKey={editing?.id || "new"}
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Enrollment" : "Enroll Student"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Student" required>
          <select ref={(el) => (form.current.student_id = el)} defaultValue={cur.student_id} className={FIELD} required>
            <option value="">— Select student —</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.enrollment_no})</option>)}
          </select>
        </FormField>

        <FormField label="Course" required>
          <select ref={(el) => (form.current.course_id = el)} defaultValue={cur.course_id} className={FIELD} required>
            <option value="">— Select course —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Status">
            <select ref={(el) => (form.current.status = el)} defaultValue={cur.status} className={FIELD}>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </FormField>
          <FormField label="Progress (%)">
            <input ref={(el) => (form.current.progress = el)} type="number" min="0" max="100" defaultValue={cur.progress} className={FIELD} />
          </FormField>
        </div>
      </CrudModal>
    </div>
  );
};

export default AdminEnrollments;
