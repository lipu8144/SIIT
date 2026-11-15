import { errText } from "../../lib/errors";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaPhoneAlt, FaWhatsapp, FaUserPlus } from "react-icons/fa";

import { CrudTable, CrudModal, FormField, FIELD } from "../../components/admin/CrudTable";
import { leadService } from "../../services/growthDb";
import { teacherService } from "../../services/erpDb";

/**
 * SIIT — Admin: Lead CRM (Phase 5)
 * Kanban pipeline + list table, add/edit, assign teacher,
 * WhatsApp quick-dial, conversion stats bar.
 */

const PIPELINE = [
  { key: "new",        label: "New",        color: "#1DA1F2" },
  { key: "contacted",  label: "Contacted",  color: "#1c3fbd" },
  { key: "interested", label: "Interested", color: "#f18032" },
  { key: "follow_up",  label: "Follow-up",  color: "#8B46FF" },
  { key: "converted",  label: "Converted",  color: "#16a34a" },
];

const SOURCES  = ["Walk-in","Website","Instagram","Facebook","WhatsApp","Referral","Other"];
const COURSES  = ["OS-CIT","Tally with GST","Advanced Excel","Photoshop","Blender","JAVA","C++","C","MS-Office","Web Development"];

const BLANK = { name:"", phone:"", email:"", course_interest:"OS-CIT", source:"Website", status:"new", assigned_to:"", remarks:"" };

const statusColor = (s) => PIPELINE.find((p) => p.key === s)?.color || "#42506a";

const AdminLeads = () => {
  const [rows,    setRows]    = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [stats,   setStats]   = useState({});
  const [view,    setView]    = useState("table");   // "table" | "kanban"
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const form = useRef({});

  const load = async () => {
    const [all, s, t] = await Promise.all([leadService.list(), leadService.stats(), teacherService.list()]);
    setRows(all); setStats(s); setAllTeachers(t);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name:            form.current.name?.value || "",
      phone:           form.current.phone?.value || "",
      email:           form.current.email?.value || "",
      course_interest: form.current.course_interest?.value || "OS-CIT",
      source:          form.current.source?.value || "Website",
      status:          form.current.status?.value || "new",
      assigned_to:     form.current.assigned_to?.value || null,
      remarks:         form.current.remarks?.value || "",
    };
    setSaving(true);
    try {
      if (editing) {
        const u = await leadService.update(editing.id, data);
        setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...u } : x)));
        toast.success("Lead updated");
      } else {
        const c = await leadService.create(data);
        setRows((r) => [c, ...r]);
        toast.success("Lead added");
      }
      setModal(false);
      leadService.stats().then(setStats);
    } catch (err) { console.error(err); toast.error(errText(err, "Failed")); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await leadService.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    leadService.stats().then(setStats);
    toast.success("Lead deleted");
  };

  const quickStatus = async (id, status) => {
    await leadService.update(id, { status });
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    leadService.stats().then(setStats);
  };

  const cols = [
    { key: "name",            label: "Name",    render: (v) => <span className="font-medium">{v}</span> },
    { key: "phone",           label: "Phone",   render: (v) => (
        <a href={`https://wa.me/91${v}`} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-[#128C3E] hover:underline">
          <FaWhatsapp size={12} /> {v}
        </a>)},
    { key: "course_interest", label: "Course"  },
    { key: "source",          label: "Source"  },
    { key: "status",          label: "Status",  render: (v, row) => (
        <select value={v}
          onChange={(e) => quickStatus(row.id, e.target.value)}
          className="rounded-full border-none bg-transparent text-xs font-medium outline-none"
          style={{ color: statusColor(v) }}
        >
          {PIPELINE.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>)},
    { key: "remarks",         label: "Remarks", render: (v) => <span className="line-clamp-1 max-w-[140px] text-xs">{v || "—"}</span> },
  ];

  const cur = editing || BLANK;

  return (
    <div>
      {/* stats bar */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total",      val: stats.total,          color: "text-[#1c3fbd]" },
          { label: "New",        val: stats.new,            color: "text-[#1DA1F2]" },
          { label: "Contacted",  val: stats.contacted,      color: "text-[#1c3fbd]" },
          { label: "Interested", val: stats.interested,     color: "text-buttons_2" },
          { label: "Converted",  val: stats.converted,      color: "text-green-600"  },
          { label: "Conv. Rate", val: `${stats.conversionRate || 0}%`, color: "text-buttons_1" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-3 text-center">
            <div className={`text-2xl font-medium ${s.color}`}>{s.val ?? 0}</div>
            <div className="text-xs text-text_color2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* view toggle */}
      <div className="mb-4 flex gap-2">
        {["table","kanban"].map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all ${
              view === v ? "border-[#1c3fbd] bg-[#1c3fbd] text-white" : "border-[#1c3fbd]/20 bg-white text-[#1c3fbd]"
            }`}>{v}</button>
        ))}
      </div>

      {view === "table" ? (
        <CrudTable title="Leads" columns={cols} rows={rows}
          onAdd={() => { setEditing(null); setModal(true); }}
          onEdit={(r) => { setEditing(r); setModal(true); }}
          onDelete={handleDelete}
          searchKeys={["name","phone","course_interest","source"]}
          addLabel="Add Lead"
        />
      ) : (
        /* Kanban */
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {PIPELINE.map((col) => {
            const colRows = rows.filter((r) => r.status === col.key);
            return (
              <div key={col.key} className="rounded-2xl bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: col.color }}>
                    {col.label}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: col.color }}>
                    {colRows.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {colRows.map((lead) => (
                    <motion.div key={lead.id} layout
                      className="cursor-pointer rounded-xl border border-grey bg-body p-2.5 text-xs hover:border-[#1c3fbd]/30"
                      onClick={() => { setEditing(lead); setModal(true); }}
                    >
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-dark-grey">{lead.course_interest}</div>
                      <div className="mt-1.5 flex items-center gap-2 text-dark-grey">
                        <FaPhoneAlt size={9} /> {lead.phone}
                      </div>
                    </motion.div>
                  ))}
                  <button onClick={() => { setEditing(null); setModal(true); }}
                    className="mt-1 flex items-center gap-1 rounded-xl border border-dashed border-grey py-2 text-center text-xs text-dark-grey hover:border-[#1c3fbd]/30 hover:text-[#1c3fbd]"
                  >
                    <FaUserPlus className="mx-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CrudModal formKey={editing?.id || "new"} open={modal} onClose={() => setModal(false)}
        title={editing ? "Edit Lead" : "Add Lead"} onSubmit={handleSubmit} loading={saving}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name" required>
            <input ref={(el) => (form.current.name = el)} defaultValue={cur.name} className={FIELD} required />
          </FormField>
          <FormField label="Phone" required>
            <input ref={(el) => (form.current.phone = el)} defaultValue={cur.phone} className={FIELD} required />
          </FormField>
        </div>
        <FormField label="Email">
          <input ref={(el) => (form.current.email = el)} type="email" defaultValue={cur.email} className={FIELD} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Interested Course">
            <select ref={(el) => (form.current.course_interest = el)} defaultValue={cur.course_interest} className={FIELD}>
              {COURSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Source">
            <select ref={(el) => (form.current.source = el)} defaultValue={cur.source} className={FIELD}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <select ref={(el) => (form.current.status = el)} defaultValue={cur.status} className={FIELD}>
              {PIPELINE.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </FormField>
          <FormField label="Assign To">
            <select ref={(el) => (form.current.assigned_to = el)} defaultValue={cur.assigned_to || ""} className={FIELD}>
              <option value="">Unassigned</option>
              {allTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Remarks">
          <textarea ref={(el) => (form.current.remarks = el)} defaultValue={cur.remarks} className={`${FIELD} h-20`} />
        </FormField>
      </CrudModal>
    </div>
  );
};

export default AdminLeads;
