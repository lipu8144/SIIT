import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaFilePdf, FaVideo, FaFileAlt } from "react-icons/fa";

import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import ImageUpload from "../../components/admin/ImageUpload";
import { BUCKETS } from "../../services/storage";
import { noteService, courseManagementService } from "../../services/erpDb";

/**
 * SIIT — Admin: Notes & Study Material
 * Upload PDFs, videos, and assignments that appear in the
 * student portal's Notes tab.
 */

const TYPES = [
  { id: "pdf",    label: "PDF / Document", Icon: FaFilePdf, color: "#eb0249" },
  { id: "video",  label: "Video",          Icon: FaVideo,   color: "#1DA1F2" },
  { id: "assign", label: "Assignment",     Icon: FaFileAlt, color: "#f18032" },
];

const BLANK = { title: "", type: "pdf", url: "", course: "", description: "", published: true };

const AdminNotes = () => {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const form = useRef({});

  const load = async () => {
    const [n, c] = await Promise.all([noteService.list(), courseManagementService.list()]);
    setRows(n);
    setCourses(c);
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setFileUrl(""); setModal(true); };
  const openEdit = (r) => { setEditing(r);   setFileUrl(r.url || ""); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title:       form.current.title?.value || "",
      type:        form.current.type?.value || "pdf",
      url:         fileUrl || null,
      course:      form.current.course?.value || "",
      description: form.current.description?.value || "",
      published:   form.current.published?.checked ?? true,
    };
    if (!data.title.trim()) { toast.error("Title is required"); return; }

    setSaving(true);
    try {
      if (editing) {
        const updated = await noteService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)));
        toast.success("Note updated");
      } else {
        const created = await noteService.create({ ...data, created_at: new Date().toISOString().slice(0, 10) });
        setRows((r) => [created, ...r]);
        toast.success("Note added — students can see it now");
      }
      setModal(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await noteService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Note deleted");
  };

  const cols = [
    { key: "title", label: "Title", render: (v) => <span className="font-medium">{v}</span> },
    {
      key: "type", label: "Type",
      render: (v) => {
        const t = TYPES.find((x) => x.id === v) || TYPES[0];
        return (
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: t.color }}>
            <t.Icon size={12} /> {t.id}
          </span>
        );
      },
    },
    { key: "course", label: "Course" },
    {
      key: "published", label: "Visible",
      render: (v) => (
        <span className={v !== false ? "text-green-600" : "text-dark-grey"}>
          {v !== false ? "Yes" : "Hidden"}
        </span>
      ),
    },
  ];

  const cur = editing || BLANK;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-medium">Notes & Study Material</h1>
        <p className="text-sm text-dark-grey">
          Upload PDFs, videos, and assignments. Published items appear in the student portal.
        </p>
      </div>

      {/* type summary */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TYPES.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white p-4">
            <div>
              <div className="text-2xl font-medium" style={{ color: t.color }}>
                {rows.filter((r) => r.type === t.id).length}
              </div>
              <div className="text-sm text-text_color2">{t.label}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${t.color}14` }}>
              <t.Icon size={18} style={{ color: t.color }} />
            </div>
          </div>
        ))}
      </div>

      <CrudTable
        title="Notes"
        columns={cols}
        rows={rows}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchKeys={["title", "course", "type"]}
        addLabel="Add Material"
      />

      <CrudModal
        formKey={editing?.id || "new"}
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Material" : "Add Material"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <FormField label="Title" required>
          <input ref={(el) => (form.current.title = el)} defaultValue={cur.title} className={FIELD} required placeholder="Chapter 1 — Introduction" />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Type">
            <select ref={(el) => (form.current.type = el)} defaultValue={cur.type} className={FIELD}>
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </FormField>
          <FormField label="Course">
            <select ref={(el) => (form.current.course = el)} defaultValue={cur.course} className={FIELD}>
              <option value="">— All courses —</option>
              {courses.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="File or Link">
          <ImageUpload
            value={fileUrl}
            onChange={setFileUrl}
            bucket={BUCKETS.notes}
            folder="material"
            accept=".pdf,.doc,.docx,.ppt,.pptx,video/*,image/*"
            hint="PDF, DOC, PPT or video · max 10 MB — or paste a YouTube/Drive link"
          />
        </FormField>

        <FormField label="Description">
          <textarea ref={(el) => (form.current.description = el)} defaultValue={cur.description} className={`${FIELD} h-20`} placeholder="Short summary for students" />
        </FormField>

        <label className="flex items-center gap-2 text-sm">
          <input ref={(el) => (form.current.published = el)} type="checkbox" defaultChecked={cur.published !== false} className="accent-buttons_1" />
          Visible to students
        </label>
      </CrudModal>
    </div>
  );
};

export default AdminNotes;
