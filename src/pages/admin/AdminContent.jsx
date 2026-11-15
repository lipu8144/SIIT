import { errText } from "../../lib/errors";
/* ── AdminNotifications ───────────────────────────────────── */
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import ImageUpload from "../../components/admin/ImageUpload";
import { BUCKETS } from "../../services/storage";
import { notificationService } from "../../services/db";

const BLANK_N = { type: "general", title: "", body: "", cta_label: "", cta_href: "", active: true, starts_at: "", ends_at: "" };

export const AdminNotifications = () => {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const form = useRef({});

  useEffect(() => { notificationService.list().then(setRows); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      type: form.current.type?.value || "general",
      title: form.current.title?.value || "",
      body: form.current.body?.value || "",
      cta_label: form.current.cta_label?.value || "",
      cta_href: form.current.cta_href?.value || "",
      active: form.current.active?.checked ?? true,
      starts_at: form.current.starts_at?.value || null,
      ends_at: form.current.ends_at?.value || null,
    };
    try {
      if (editing) {
        const updated = await notificationService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)));
        toast.success("Notification updated — refreshes on next page load");
      } else {
        const created = await notificationService.create(data);
        setRows((r) => [created, ...r]);
        toast.success("Notification created — visible on site now");
      }
      setModal(false);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await notificationService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const cols = [
    { key: "title", label: "Title", render: (v) => <span className="font-medium">{v}</span> },
    { key: "type", label: "Type", render: (v) => <span className="capitalize">{v}</span> },
    { key: "active", label: "Active", render: (v) => <span className={v ? "text-green-600" : "text-dark-grey"}>{v ? "Yes" : "No"}</span> },
  ];

  const cur = editing || BLANK_N;
  return (
    <>
      <CrudTable title="Notifications" columns={cols} rows={rows}
        onAdd={() => { setEditing(null); setModal(true); }}
        onEdit={(r) => { setEditing(r); setModal(true); }}
        onDelete={handleDelete}
        searchKeys={["title","type"]} addLabel="New Notification"
      />
      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)} title={editing ? "Edit Notification" : "New Notification"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Title" required><input ref={(el) => (form.current.title = el)} defaultValue={cur.title} className={FIELD} required /></FormField>
        <FormField label="Type">
          <select ref={(el) => (form.current.type = el)} defaultValue={cur.type} className={FIELD}>
            {["admission","event","exam","general"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Message Body"><textarea ref={(el) => (form.current.body = el)} defaultValue={cur.body} className={`${FIELD} h-20`} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="CTA Label"><input ref={(el) => (form.current.cta_label = el)} defaultValue={cur.cta_label} className={FIELD} placeholder="e.g. Apply now" /></FormField>
          <FormField label="CTA Link"><input ref={(el) => (form.current.cta_href = el)} defaultValue={cur.cta_href} className={FIELD} placeholder="/courses" /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date"><input ref={(el) => (form.current.starts_at = el)} type="date" defaultValue={cur.starts_at} className={FIELD} /></FormField>
          <FormField label="End Date"><input ref={(el) => (form.current.ends_at = el)} type="date" defaultValue={cur.ends_at} className={FIELD} /></FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input ref={(el) => (form.current.active = el)} type="checkbox" defaultChecked={cur.active} className="accent-buttons_1" />
          Active (show in top notification bar)
        </label>
      </CrudModal>
    </>
  );
};

/* ── AdminGallery ─────────────────────────────────────────── */
import { galleryService } from "../../services/db";

const BLANK_G = { album: "Campus", type: "image", url: "", caption: "" };

export const AdminGallery = () => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const form = useRef({});

  useEffect(() => { galleryService.list({ status: null }).then(setRows); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { album: form.current.album?.value, type: form.current.type?.value, url: mediaUrl || null, caption: form.current.caption?.value };
    setSaving(true);
    try {
      if (editing) {
        const u = await galleryService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Updated");
      } else {
        const c = await galleryService.create(data);
        setRows((r) => [c, ...r]);
        toast.success("Added");
      }
      setModal(false);
    } catch (err) { console.error(err); toast.error(errText(err, "Failed")); } finally { setSaving(false); }
  };

  const cols = [
    { key: "caption", label: "Caption", render: (v) => <span className="font-medium">{v}</span> },
    { key: "album", label: "Album" },
    { key: "type", label: "Type", render: (v) => <span className="capitalize">{v}</span> },
  ];

  const cur = editing || BLANK_G;
  return (
    <>
      <CrudTable title="Gallery" columns={cols} rows={rows}
        onAdd={() => { setEditing(null); setMediaUrl(""); setModal(true); }}
        onEdit={(r) => { setEditing(r); setMediaUrl(r.url || ""); setModal(true); }}
        onDelete={async (id) => { await galleryService.remove(id); setRows((r) => r.filter((x) => x.id !== id)); toast.success("Deleted"); }}
        searchKeys={["caption","album"]} addLabel="Add Media"
      />
      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)} title={editing ? "Edit Media" : "Add Media"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Album"><input ref={(el) => (form.current.album = el)} defaultValue={cur.album} className={FIELD} /></FormField>
          <FormField label="Type"><select ref={(el) => (form.current.type = el)} defaultValue={cur.type} className={FIELD}><option value="image">Image</option><option value="video">Video</option></select></FormField>
        </div>
        <FormField label="Image / Video">
          <ImageUpload value={mediaUrl} onChange={setMediaUrl} bucket={BUCKETS.gallery} folder="album" accept="image/*,video/*" hint="Image or video · max 10 MB" />
        </FormField>
        <FormField label="Caption"><input ref={(el) => (form.current.caption = el)} defaultValue={cur.caption} className={FIELD} /></FormField>
      </CrudModal>
    </>
  );
};

/* ── AdminTestimonials ────────────────────────────────────── */
import { testimonialService } from "../../services/db";

const BLANK_T = { name: "", photo_url: "", course: "", review: "", rating: 5, achievement: "", featured: false };

export const AdminTestimonials = () => {
  const [photoUrl, setPhotoUrl] = useState("");
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const form = useRef({});

  useEffect(() => { testimonialService.list({ status: null }).then(setRows); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.current.name?.value, photo_url: photoUrl || null,
      course: form.current.course?.value, review: form.current.review?.value,
      rating: Number(form.current.rating?.value) || 5,
      achievement: form.current.achievement?.value, featured: form.current.featured?.checked || false,
    };
    setSaving(true);
    try {
      if (editing) {
        const u = await testimonialService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Updated");
      } else {
        const c = await testimonialService.create(data);
        setRows((r) => [c, ...r]);
        toast.success("Added");
      }
      setModal(false);
    } catch (err) { console.error(err); toast.error(errText(err, "Failed")); } finally { setSaving(false); }
  };

  const cols = [
    { key: "name", label: "Name", render: (v) => <span className="font-medium">{v}</span> },
    { key: "course", label: "Course" },
    { key: "rating", label: "Rating", render: (v) => `${v}/5` },
    { key: "featured", label: "Featured", render: (v) => v ? <span className="text-green-600">✓</span> : "—" },
  ];

  const cur = editing || BLANK_T;
  return (
    <>
      <CrudTable title="Testimonials" columns={cols} rows={rows}
        onAdd={() => { setEditing(null); setPhotoUrl(""); setModal(true); }}
        onEdit={(r) => { setEditing(r); setPhotoUrl(r.photo_url || ""); setModal(true); }}
        onDelete={async (id) => { await testimonialService.remove(id); setRows((r) => r.filter((x) => x.id !== id)); toast.success("Deleted"); }}
        searchKeys={["name","course"]} addLabel="Add Testimonial"
      />
      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)} title={editing ? "Edit Testimonial" : "Add Testimonial"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name" required><input ref={(el) => (form.current.name = el)} defaultValue={cur.name} className={FIELD} required /></FormField>
          <FormField label="Course"><input ref={(el) => (form.current.course = el)} defaultValue={cur.course} className={FIELD} /></FormField>
        </div>
        <FormField label="Student Photo">
          <ImageUpload value={photoUrl} onChange={setPhotoUrl} bucket={BUCKETS.avatars} folder="testimonials" />
        </FormField>
        <FormField label="Review"><textarea ref={(el) => (form.current.review = el)} defaultValue={cur.review} className={`${FIELD} h-20`} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Rating (1–5)"><input ref={(el) => (form.current.rating = el)} type="number" min="1" max="5" step="0.5" defaultValue={cur.rating} className={FIELD} /></FormField>
          <FormField label="Achievement"><input ref={(el) => (form.current.achievement = el)} defaultValue={cur.achievement} className={FIELD} placeholder="e.g. Placed" /></FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input ref={(el) => (form.current.featured = el)} type="checkbox" defaultChecked={cur.featured} className="accent-buttons_1" />
          Feature on homepage
        </label>
      </CrudModal>
    </>
  );
};
