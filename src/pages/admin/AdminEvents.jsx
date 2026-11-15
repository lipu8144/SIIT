import { errText } from "../../lib/errors";
import { slugify } from "../../lib/slug";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { eventService } from "../../services/db";

const BLANK = { title: "", slug: "", description: "", location: "SIIT Campus, Sorada", starts_at: "", ends_at: "", status: "draft", registration_open: false, capacity: "" };

const AdminEvents = () => {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const form = useRef({});

  useEffect(() => { eventService.list({ status: null }).then(setRows); }, []);

  const openAdd = () => { setEditing(null); setModal(true); };
  const openEdit = (row) => { setEditing(row); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: form.current.title?.value || "",
      slug: slugify(form.current.slug?.value || form.current.title?.value),
      description: form.current.description?.value || "",
      location: form.current.location?.value || "",
      starts_at: form.current.starts_at?.value || null,
      ends_at: form.current.ends_at?.value || null,
      status: form.current.status?.value || "draft",
      registration_open: form.current.registration_open?.checked || false,
      capacity: form.current.capacity?.value ? Number(form.current.capacity.value) : null,
    };
    setSaving(true);
    try {
      if (editing) {
        const u = await eventService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Event updated");
      } else {
        const c = await eventService.create(data);
        setRows((r) => [c, ...r]);
        toast.success("Event created");
      }
      setModal(false);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await eventService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Event deleted");
  };

  const cols = [
    { key: "title", label: "Title", render: (v) => <span className="line-clamp-1 max-w-[200px] font-medium">{v}</span> },
    { key: "starts_at", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
    { key: "location", label: "Location" },
    { key: "registration_open", label: "Reg.", render: (v) => (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${v ? "bg-green-100 text-green-700" : "bg-grey text-dark-grey"}`}>
          {v ? "Open" : "Closed"}
        </span>
      )},
    { key: "status", label: "Status", render: (v) => <span className="capitalize">{v}</span> },
  ];

  const cur = editing || BLANK;

  return (
    <>
      <CrudTable title="Events" columns={cols} rows={rows} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} searchKeys={["title","location"]} addLabel="New Event" />
      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)} title={editing ? "Edit Event" : "New Event"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Title" required>
          <input ref={(el) => (form.current.title = el)} defaultValue={cur.title} className={FIELD} required />
        </FormField>
        <FormField label="Description">
          <textarea ref={(el) => (form.current.description = el)} defaultValue={cur.description} className={`${FIELD} h-20`} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Starts At">
            <input ref={(el) => (form.current.starts_at = el)} type="datetime-local" defaultValue={cur.starts_at?.slice(0, 16)} className={FIELD} />
          </FormField>
          <FormField label="Ends At">
            <input ref={(el) => (form.current.ends_at = el)} type="datetime-local" defaultValue={cur.ends_at?.slice(0, 16)} className={FIELD} />
          </FormField>
        </div>
        <FormField label="Location">
          <input ref={(el) => (form.current.location = el)} defaultValue={cur.location} className={FIELD} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <select ref={(el) => (form.current.status = el)} defaultValue={cur.status} className={FIELD}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </FormField>
          <FormField label="Capacity">
            <input ref={(el) => (form.current.capacity = el)} type="number" defaultValue={cur.capacity || ""} className={FIELD} placeholder="Leave blank for unlimited" />
          </FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input ref={(el) => (form.current.registration_open = el)} type="checkbox" defaultChecked={cur.registration_open} className="accent-buttons_1" />
          Registration open
        </label>
      </CrudModal>
    </>
  );
};

export default AdminEvents;
