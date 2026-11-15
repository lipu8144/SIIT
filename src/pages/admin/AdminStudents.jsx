import { errText } from "../../lib/errors";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaUserGraduate } from "react-icons/fa";
import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { studentService, courseManagementService } from "../../services/erpDb";

/**
 * SIIT — Admin: Students (Phase 4)
 * Full CRUD + stats bar. Data via studentService.
 */

const STATUS = {
  active:   "bg-green-100 text-green-700",
  inactive: "bg-grey text-dark-grey",
};

const BLANK = {
  name: "", email: "", phone: "", enrollment_no: "", course_id: "c1",
  course_name: "OS-CIT", batch: "", address: "", status: "active",
};

const AdminStudents = () => {
  const [rows, setRows]     = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [stats, setStats]   = useState({ total: 0, active: 0, inactive: 0 });
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const form = useRef({});

  const load = async () => {
    const [all, s, courses] = await Promise.all([
      studentService.list(), studentService.stats(), courseManagementService.list(),
    ]);
    setRows(all);
    setStats(s);
    setAllCourses(courses);
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null);  setModal(true); };
  const openEdit = (r) => { setEditing(r);    setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const courseId   = form.current.course_id?.value || null;
    const courseName = allCourses.find((c) => c.id === courseId)?.name || "";
    const data = {
      name:          form.current.name?.value || "",
      email:         form.current.email?.value || "",
      phone:         form.current.phone?.value || "",
      enrollment_no: form.current.enrollment_no?.value || "",
      course_id:     courseId,
      course_name:   courseName,
      batch:         form.current.batch?.value || "",
      address:       form.current.address?.value || "",
      status:        form.current.status?.value || "active",
    };
    setSaving(true);
    try {
      if (editing) {
        const u = await studentService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Student updated");
      } else {
        const c = await studentService.create({ ...data, joined_at: new Date().toISOString().split("T")[0] });
        setRows((r) => [c, ...r]);
        toast.success("Student added");
      }
      setModal(false);
      studentService.stats().then(setStats);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await studentService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    studentService.stats().then(setStats);
    toast.success("Student removed");
  };

  const cols = [
    { key: "enrollment_no", label: "Enroll #" },
    { key: "name",    label: "Name",   render: (v) => <span className="font-medium">{v}</span> },
    { key: "course_name", label: "Course" },
    { key: "batch",   label: "Batch" },
    { key: "phone",   label: "Phone" },
    { key: "status",  label: "Status", render: (v) => (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS[v] || ""}`}>{v}</span>
      )},
  ];

  const cur = editing || BLANK;

  return (
    <>
      {/* stats bar */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Students", val: stats.total,    color: "text-[#1c3fbd]", icon: <FaUserGraduate /> },
          { label: "Active",         val: stats.active,   color: "text-green-600",  icon: <FaUserGraduate /> },
          { label: "Inactive",       val: stats.inactive, color: "text-dark-grey",  icon: <FaUserGraduate /> },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-2xl bg-white p-4">
            <div>
              <div className={`text-3xl font-medium ${s.color}`}>{s.val}</div>
              <div className="text-sm text-text_color2">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <CrudTable
        title="Students"
        columns={cols}
        rows={rows}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchKeys={["name", "email", "enrollment_no", "course_name"]}
        addLabel="Add Student"
      />

      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)}
        title={editing ? "Edit Student" : "Add Student"}
        onSubmit={handleSubmit} loading={saving}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <input ref={(el) => (form.current.name = el)} defaultValue={cur.name} className={FIELD} required />
          </FormField>
          <FormField label="Enrollment No.">
            <input ref={(el) => (form.current.enrollment_no = el)} defaultValue={cur.enrollment_no} className={FIELD} placeholder="SIIT/2025/001" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email">
            <input ref={(el) => (form.current.email = el)} type="email" defaultValue={cur.email} className={FIELD} />
          </FormField>
          <FormField label="Phone">
            <input ref={(el) => (form.current.phone = el)} defaultValue={cur.phone} className={FIELD} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Course" required>
            <select ref={(el) => (form.current.course_id = el)} defaultValue={cur.course_id} className={FIELD}>
              {allCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Batch">
            <input ref={(el) => (form.current.batch = el)} defaultValue={cur.batch} className={FIELD} placeholder="Batch A 2025" />
          </FormField>
        </div>
        <FormField label="Address">
          <input ref={(el) => (form.current.address = el)} defaultValue={cur.address} className={FIELD} />
        </FormField>
        <FormField label="Status">
          <select ref={(el) => (form.current.status = el)} defaultValue={cur.status} className={FIELD}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>
      </CrudModal>
    </>
  );
};

export default AdminStudents;
