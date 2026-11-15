import { errText } from "../../lib/errors";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { teacherService } from "../../services/erpDb";

/**
 * SIIT — Admin: Teachers (Phase 4)
 */

const BLANK = {
  name: "", email: "", phone: "", subjects: [],
  qualification: "", experience_yrs: "", status: "active",
};

const AdminTeachers = () => {
  const [rows, setRows]       = useState([]);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const form = useRef({});

  useEffect(() => { teacherService.list().then(setRows); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subjectRaw = form.current.subjects?.value || "";
    const data = {
      name:           form.current.name?.value || "",
      email:          form.current.email?.value || "",
      phone:          form.current.phone?.value || "",
      subjects:       subjectRaw.split(",").map((s) => s.trim()).filter(Boolean),
      qualification:  form.current.qualification?.value || "",
      experience_yrs: Number(form.current.experience_yrs?.value) || 0,
      status:         form.current.status?.value || "active",
    };
    setSaving(true);
    try {
      if (editing) {
        const u = await teacherService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Teacher updated");
      } else {
        const c = await teacherService.create({ ...data, joined_at: new Date().toISOString().split("T")[0] });
        setRows((r) => [c, ...r]);
        toast.success("Teacher added");
      }
      setModal(false);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await teacherService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Teacher removed");
  };

  const cols = [
    { key: "name",          label: "Name",           render: (v) => <span className="font-medium">{v}</span> },
    { key: "email",         label: "Email" },
    { key: "subjects",      label: "Subjects",        render: (v) => Array.isArray(v) ? v.slice(0, 2).join(", ") + (v.length > 2 ? "…" : "") : v },
    { key: "qualification", label: "Qualification" },
    { key: "experience_yrs",label: "Exp. (yrs)" },
    { key: "status",        label: "Status",          render: (v) => (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${v === "active" ? "bg-green-100 text-green-700" : "bg-grey text-dark-grey"}`}>{v}</span>
      )},
  ];

  const cur = editing || BLANK;

  return (
    <>
      <CrudTable title="Teachers" columns={cols} rows={rows}
        onAdd={() => { setEditing(null); setModal(true); }}
        onEdit={(r) => { setEditing(r); setModal(true); }}
        onDelete={handleDelete}
        searchKeys={["name", "email"]}
        addLabel="Add Teacher"
      />
      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)}
        title={editing ? "Edit Teacher" : "Add Teacher"}
        onSubmit={handleSubmit} loading={saving}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <input ref={(el) => (form.current.name = el)} defaultValue={cur.name} className={FIELD} required />
          </FormField>
          <FormField label="Email">
            <input ref={(el) => (form.current.email = el)} type="email" defaultValue={cur.email} className={FIELD} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone">
            <input ref={(el) => (form.current.phone = el)} defaultValue={cur.phone} className={FIELD} />
          </FormField>
          <FormField label="Experience (years)">
            <input ref={(el) => (form.current.experience_yrs = el)} type="number" defaultValue={cur.experience_yrs} className={FIELD} />
          </FormField>
        </div>
        <FormField label="Subjects (comma separated)">
          <input ref={(el) => (form.current.subjects = el)}
            defaultValue={Array.isArray(cur.subjects) ? cur.subjects.join(", ") : cur.subjects}
            className={FIELD} placeholder="Tally with GST, MS-Excel" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Qualification">
            <input ref={(el) => (form.current.qualification = el)} defaultValue={cur.qualification} className={FIELD} placeholder="MCA, B.Com…" />
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

export default AdminTeachers;
