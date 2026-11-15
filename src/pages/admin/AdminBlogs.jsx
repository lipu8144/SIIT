import { errText } from "../../lib/errors";
import { slugify } from "../../lib/slug";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { blogService } from "../../services/db";
import ImageUpload from "../../components/admin/ImageUpload";
import { BUCKETS } from "../../services/storage";

/**
 * SIIT — Admin: Blogs
 * Full CRUD via blogService (dummy ↔ Supabase swap seam).
 * Note: in dummy mode create/update/delete return the updated object
 * but don't mutate the in-memory seed; state is managed locally here.
 */

const STATUS_BADGE = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-800",
};

const BLANK = { title: "", slug: "", excerpt: "", body: "", author: "SIIT Faculty", category: "Career", status: "draft", featured: false, publish_at: "" };

const AdminBlogs = () => {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const form = useRef({});

  useEffect(() => {
    blogService.list({ status: null }).then(setRows);
  }, []);

  const openAdd = () => { setEditing(null); setCoverUrl(""); setModal(true); };
  const openEdit = (row) => { setEditing(row); setCoverUrl(row.cover_url || ""); setModal(true); };
  const closeModal = () => setModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: form.current.title?.value || "",
      slug: slugify(form.current.slug?.value || form.current.title?.value),
      cover_url: coverUrl || null,
      excerpt: form.current.excerpt?.value || "",
      body: form.current.body?.value || "",
      author: form.current.author?.value || "SIIT Faculty",
      category: form.current.category?.value || "Career",
      status: form.current.status?.value || "draft",
      featured: form.current.featured?.checked || false,
      publish_at: form.current.publish_at?.value || new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (editing) {
        const updated = await blogService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)));
        toast.success("Blog updated");
      } else {
        const created = await blogService.create(data);
        setRows((r) => [created, ...r]);
        toast.success("Blog created");
      }
      closeModal();
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await blogService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Blog deleted");
  };

  const cols = [
    { key: "title", label: "Title", render: (v) => <span className="line-clamp-1 max-w-[240px] font-medium">{v}</span> },
    { key: "category", label: "Category" },
    { key: "featured", label: "Featured", render: (v) => v ? <span className="text-green-600">✓</span> : "—" },
    { key: "status", label: "Status", render: (v) => (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_BADGE[v] || ""}`}>{v}</span>
      )},
    { key: "publish_at", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
  ];

  const cur = editing || BLANK;

  return (
    <>
      <CrudTable
        title="Blogs"
        columns={cols}
        rows={rows}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchKeys={["title", "category"]}
        addLabel="New Blog"
      />
      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={closeModal} title={editing ? "Edit Blog" : "New Blog"} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Title" required>
          <input ref={(el) => (form.current.title = el)} defaultValue={cur.title} className={FIELD} placeholder="Blog title" required />
        </FormField>
        <FormField label="Slug">
          <input ref={(el) => (form.current.slug = el)} defaultValue={cur.slug} className={FIELD} placeholder="auto-generated if blank" />
        </FormField>
        <FormField label="Cover Image">
          <ImageUpload value={coverUrl} onChange={setCoverUrl} bucket={BUCKETS.blogCovers} folder="covers" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" required>
            <select ref={(el) => (form.current.category = el)} defaultValue={cur.category} className={FIELD}>
              {["Career","Tutorials","Placements","General"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select ref={(el) => (form.current.status = el)} defaultValue={cur.status} className={FIELD}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </FormField>
        </div>
        <FormField label="Author">
          <input ref={(el) => (form.current.author = el)} defaultValue={cur.author} className={FIELD} />
        </FormField>
        <FormField label="Excerpt">
          <textarea ref={(el) => (form.current.excerpt = el)} defaultValue={cur.excerpt} className={`${FIELD} h-16`} />
        </FormField>
        <FormField label="Body">
          <textarea ref={(el) => (form.current.body = el)} defaultValue={cur.body} className={`${FIELD} h-28`} />
        </FormField>
        <FormField label="Publish Date">
          <input ref={(el) => (form.current.publish_at = el)} type="datetime-local" defaultValue={cur.publish_at?.slice(0, 16)} className={FIELD} />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input ref={(el) => (form.current.featured = el)} type="checkbox" defaultChecked={cur.featured} className="accent-buttons_1" />
          Mark as featured
        </label>
      </CrudModal>
    </>
  );
};

export default AdminBlogs;
