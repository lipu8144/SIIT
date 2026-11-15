import { errText } from "../../lib/errors";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { courseManagementService, teacherService } from "../../services/erpDb";
import ImageUpload from "../../components/admin/ImageUpload";
import { BUCKETS } from "../../services/storage";

/**
 * SIIT — Admin: Courses management (Phase 4)
 * Separate from the public Courses page (which uses fakeFetchCourses).
 * This module manages seats, fees, teacher assignment, enrolment counts.
 */

const CATEGORIES = ["Computer", "MS-Office", "Design", "Account", "Programming"];

const BLANK = {
  name: "", category: "Computer", duration_months: 3, fee: 2500,
  teacher_id: "", seats: 25, enrolled: 0, status: "active",
};

const AdminCourses = () => {
  const [rows, setRows]     = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [stats, setStats]   = useState({ total: 0, totalSeats: 0, totalEnrolled: 0 });
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [thumbUrl, setThumbUrl] = useState("");
  const form = useRef({});

  const load = async () => {
    const [all, s, t] = await Promise.all([
      courseManagementService.list(),
      courseManagementService.stats(),
      teacherService.list(),
    ]);
    setRows(all); setStats(s); setAllTeachers(t);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name:             form.current.name?.value || "",
      category:         form.current.category?.value || "Computer",
      thumbnail:        thumbUrl || null,
      duration_months:  Number(form.current.duration_months?.value) || 3,
      fee:              Number(form.current.fee?.value) || 0,
      teacher_id:       form.current.teacher_id?.value || null,
      seats:            Number(form.current.seats?.value) || 25,
      enrolled:         Number(form.current.enrolled?.value) || 0,
      status:           form.current.status?.value || "active",
    };
    setSaving(true);
    try {
      if (editing) {
        const u = await courseManagementService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Course updated");
      } else {
        const c = await courseManagementService.create(data);
        setRows((r) => [c, ...r]);
        toast.success("Course added");
      }
      setModal(false);
      courseManagementService.stats().then(setStats);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await courseManagementService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    courseManagementService.stats().then(setStats);
    toast.success("Course removed");
  };

  const cols = [
    { key: "name",            label: "Course",    render: (v) => <span className="font-medium">{v}</span> },
    { key: "category",        label: "Category" },
    { key: "duration_months", label: "Duration",  render: (v) => `${v} mo.` },
    { key: "fee",             label: "Fee (₹)",   render: (v) => `₹${v.toLocaleString()}` },
    { key: "enrolled",        label: "Enrolled",  render: (v, row) => `${v} / ${row.seats}` },
    { key: "status",          label: "Status",    render: (v) => (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${v === "active" ? "bg-green-100 text-green-700" : "bg-grey text-dark-grey"}`}>{v}</span>
      )},
  ];

  const cur = editing || BLANK;

  return (
    <>
      {/* stats */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Courses",   val: stats.total,         color: "text-[#1c3fbd]" },
          { label: "Total Seats",     val: stats.totalSeats,    color: "text-buttons_2" },
          { label: "Total Enrolled",  val: stats.totalEnrolled, color: "text-buttons_1" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4">
            <div className={`text-3xl font-medium ${s.color}`}>{s.val}</div>
            <div className="text-sm text-text_color2">{s.label}</div>
          </div>
        ))}
      </div>

      <CrudTable title="Courses" columns={cols} rows={rows}
        onAdd={() => { setEditing(null); setThumbUrl(""); setModal(true); }}
        onEdit={(r) => { setEditing(r); setThumbUrl(r.thumbnail || ""); setModal(true); }}
        onDelete={handleDelete}
        searchKeys={["name", "category"]}
        addLabel="Add Course"
      />

      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)}
        title={editing ? "Edit Course" : "Add Course"}
        onSubmit={handleSubmit} loading={saving}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Course Name" required>
            <input ref={(el) => (form.current.name = el)} defaultValue={cur.name} className={FIELD} required />
          </FormField>
          <FormField label="Category">
            <select ref={(el) => (form.current.category = el)} defaultValue={cur.category} className={FIELD}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Course Thumbnail">
          <ImageUpload value={thumbUrl} onChange={setThumbUrl} bucket={BUCKETS.gallery} folder="courses" />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Duration (months)">
            <input ref={(el) => (form.current.duration_months = el)} type="number" defaultValue={cur.duration_months} className={FIELD} />
          </FormField>
          <FormField label="Fee (₹)">
            <input ref={(el) => (form.current.fee = el)} type="number" defaultValue={cur.fee} className={FIELD} />
          </FormField>
          <FormField label="Total Seats">
            <input ref={(el) => (form.current.seats = el)} type="number" defaultValue={cur.seats} className={FIELD} />
          </FormField>
        </div>
        <FormField label="Assigned Teacher">
          <select ref={(el) => (form.current.teacher_id = el)} defaultValue={cur.teacher_id || ""} className={FIELD}>
            <option value="">— No teacher yet —</option>
            {allTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Currently Enrolled">
            <input ref={(el) => (form.current.enrolled = el)} type="number" defaultValue={cur.enrolled} className={FIELD} />
          </FormField>
          <FormField label="Status">
            <select ref={(el) => (form.current.status = el)} defaultValue={cur.status} className={FIELD}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>
      </CrudModal>
    </>
  );
};

export default AdminCourses;
