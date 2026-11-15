import { errText } from "../../lib/errors";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaGlobe, FaSave } from "react-icons/fa";
import { seoService } from "../../services/growthDb";

/**
 * SIIT — Admin: SEO Manager (Phase 5)
 * Edit meta title, description, OG image, keywords per page.
 * Saves via seoService (dummy / Supabase). Inline editing, no modal.
 */

const FIELD = "w-full rounded-lg border border-[#1c3fbd]/20 bg-body px-3 py-2 text-sm outline-none transition focus:border-[#1c3fbd] focus:ring-1 focus:ring-[#1c3fbd]/20";

const PAGE_ICONS = { home:"🏠", courses:"📚", about:"ℹ️", blog:"✍️", events:"📅", contact:"📞" };

const SEORow = ({ row, onSave }) => {
  const [data, setData] = useState({ ...row });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const change = (key, val) => {
    setData((d) => ({ ...d, [key]: val }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const u = await seoService.update(row.id, data);
      onSave(u);
      setDirty(false);
      toast.success(`SEO saved for /${row.page}`);
    } catch (err) { console.error(err); toast.error(errText(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl bg-white">
      <div className="flex items-center justify-between border-b border-grey bg-body px-4 py-3">
        <div className="flex items-center gap-2 font-medium">
          <span>{PAGE_ICONS[row.page] || "📄"}</span>
          <span className="capitalize">/{row.page}</span>
        </div>
        <button onClick={save} disabled={!dirty || saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1c3fbd] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          <FaSave size={10} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-dark-grey">Meta Title</label>
          <input className={FIELD} value={data.title}
            onChange={(e) => change("title", e.target.value)}
            maxLength={60} placeholder="60 chars max" />
          <div className="mt-0.5 text-right text-[10px] text-dark-grey">{data.title?.length || 0}/60</div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-dark-grey">OG Image URL</label>
          <input className={FIELD} value={data.og_image || ""}
            onChange={(e) => change("og_image", e.target.value)}
            placeholder="https://… or leave blank" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-dark-grey">Meta Description</label>
          <textarea className={`${FIELD} h-16`} value={data.description}
            onChange={(e) => change("description", e.target.value)}
            maxLength={160} placeholder="160 chars max" />
          <div className="mt-0.5 text-right text-[10px] text-dark-grey">{data.description?.length || 0}/160</div>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-dark-grey">Keywords (comma separated)</label>
          <input className={FIELD}
            value={Array.isArray(data.keywords) ? data.keywords.join(", ") : data.keywords || ""}
            onChange={(e) => change("keywords", e.target.value.split(",").map((k) => k.trim()))}
            placeholder="SIIT, OS-CIT, computer institute Sorada" />
        </div>
      </div>
    </div>
  );
};

const AdminSEO = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => { seoService.list().then(setRows); }, []);

  const handleSave = (updated) => {
    setRows((r) => r.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <FaGlobe className="text-[#1c3fbd]" size={20} />
        <h1 className="text-2xl font-medium">SEO Manager</h1>
      </div>
      <p className="mb-6 text-sm text-text_color2">
        Edit meta tags per page. Changes take effect on the next deploy when wired to <code>react-helmet-async</code> or Next.js metadata.
      </p>
      {rows.map((row) => (
        <SEORow key={row.id} row={row} onSave={handleSave} />
      ))}
    </div>
  );
};

export default AdminSEO;
