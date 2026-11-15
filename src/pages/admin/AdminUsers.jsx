import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaUserPlus, FaKey, FaTrash, FaCopy, FaWhatsapp, FaSearch, FaTimes, FaSyncAlt, FaEye, FaEyeSlash,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { FIELD, FormField } from "../../components/admin/CrudTable";
import { userService, userAdminService } from "../../services/db";
import { studentService } from "../../services/erpDb";
import { useAuth } from "../../context/AuthProvider";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { generatePassword, suggestUsername } from "../../lib/loginId";

/**
 * SIIT — Admin: User Management
 * The admin creates every login. Students never sign up and never need an
 * email — they get a User ID + password from here.
 *  • Create login (student / teacher / admin)
 *  • Reset a forgotten password
 *  • Delete a login
 *  • Change a role
 * Real logins are created by the `admin-users` Edge Function (it holds the
 * secret key). In demo mode everything works in memory.
 */

const ROLE_BADGE = {
  student:     "bg-blue-100 text-blue-700",
  teacher:     "bg-amber-100 text-amber-700",
  admin:       "bg-purple-100 text-purple-700",
  super_admin: "bg-red-100 text-red-700",
};

const label = (r) => r.replace("_", " ");

/* small reusable modal shell */
const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 sm:items-center"
      >
        <motion.div
          initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg overflow-hidden rounded-2xl bg-white"
        >
          <div className="flex items-center justify-between border-b border-grey px-6 py-4">
            <h2 className="text-lg font-medium">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-dark-grey hover:bg-grey" aria-label="Close">
              <FaTimes />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* password input with show/hide + generate */
const PasswordField = ({ value, onChange }) => {
  const [show, setShow] = useState(true);
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className={`${FIELD} pr-10 font-mono`}
        />
        <button type="button" onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-grey" aria-label="Show or hide">
          {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>
      <button type="button" onClick={() => onChange(generatePassword())}
        className="inline-flex items-center gap-2 rounded-lg border border-[#1c3fbd]/20 px-3 text-sm text-[#1c3fbd] hover:bg-[#1c3fbd]/5"
        title="Generate a new password">
        <FaSyncAlt size={12} /> New
      </button>
    </div>
  );
};

const EMPTY_FORM = () => ({ role: "student", studentId: "", name: "", username: "", password: generatePassword(), phone: "" });

const AdminUsers = () => {
  const { user: me, role: myRole } = useAuth();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [f, setF] = useState(EMPTY_FORM);
  const [resetFor, setResetFor] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [creds, setCreds] = useState(null); // { name, username, password, kind }
  const [saving, setSaving] = useState(false);

  const creatableRoles = myRole === "super_admin" ? ["student", "teacher", "admin"] : ["student", "teacher"];

  const load = async () => {
    const [u, s] = await Promise.all([userService.list(), studentService.list().catch(() => [])]);
    setRows(u);
    setStudents(s);
  };
  useEffect(() => { load(); }, []);

  // students that do not have a login yet
  const unlinked = useMemo(() => students.filter((s) => !s.user_id), [students]);

  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));

  const pickStudent = (id) => {
    const s = students.find((x) => String(x.id) === String(id));
    if (!s) { set({ studentId: "" }); return; }
    set({
      studentId: s.id,
      name: s.name || "",
      username: suggestUsername(s.enrollment_no || s.name),
      phone: s.phone || "",
    });
  };

  const openCreate = () => { setF(EMPTY_FORM()); setCreateOpen(true); };

  /* ── create ─────────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAdminService.create({
        username: f.username,
        name: f.name,
        password: f.password,
        role: f.role,
        phone: f.phone,
        student_id: f.role === "student" && f.studentId ? f.studentId : null,
      });

      // demo mode: link the student record here (real mode links on the server)
      if (!isSupabaseConfigured && f.studentId) {
        await studentService.update(f.studentId, { user_id: res.id }).catch(() => {});
      }
      if (f.studentId && res.linked === false) {
        toast("Login created, but it could not be linked to the student record.", { icon: "⚠️" });
      }

      setCreateOpen(false);
      setCreds({ name: f.name, username: res.username || f.username.toLowerCase(), password: f.password, kind: "created" });
      await load();
    } catch (err) {
      toast.error(err?.message || "Could not create login");
    } finally {
      setSaving(false);
    }
  };

  /* ── reset password ─────────────────────────────── */
  const openReset = (row) => { setResetFor(row); setNewPw(generatePassword()); };

  const handleReset = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAdminService.resetPassword(resetFor.id, newPw);
      setCreds({ name: resetFor.name, username: resetFor.username || resetFor.email, password: newPw, kind: "reset" });
      setResetFor(null);
    } catch (err) {
      toast.error(err?.message || "Could not reset password");
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ─────────────────────────────────────── */
  const handleDelete = async (row) => {
    if (!window.confirm(`Delete the login for ${row.name}?\n\nThey will no longer be able to sign in. Their student record is kept.`)) return;
    try {
      await userAdminService.remove(row.id);
      toast.success("Login deleted");
      await load();
    } catch (err) {
      toast.error(err?.message || "Could not delete");
    }
  };

  /* ── role change ────────────────────────────────── */
  const handleRoleChange = async (row, newRole) => {
    try {
      await userService.updateRole(row.id, newRole);
      setRows((r) => r.map((u) => (u.id === row.id ? { ...u, role: newRole } : u)));
      toast.success(`Role updated to ${label(newRole)}`);
    } catch (err) {
      toast.error(err?.message || "Failed to update role");
    }
  };

  /* ── share credentials ──────────────────────────── */
  const shareText = (c) =>
    `SIIT Student Portal login\nUser ID: ${c.username}\nPassword: ${c.password}\nWebsite: ${window.location.origin}/signin`;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy. Please select and copy manually.");
    }
  };

  const filtered = rows.filter((r) =>
    [r.name, r.username, r.email, r.role].some((v) => String(v ?? "").toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">User Management</h1>
          <p className="text-sm text-dark-grey">
            Create the User ID and password for each student. Students cannot sign up themselves.
          </p>
        </div>
        <button onClick={openCreate} className="btn-dark inline-flex items-center gap-2 text-sm">
          <FaUserPlus size={13} /> Create Login
        </button>
      </div>

      {/* role summary */}
      <div className="mb-5 flex flex-wrap gap-3">
        {["student", "teacher", "admin", "super_admin"].map((r) => (
          <div key={r} className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${ROLE_BADGE[r]}`}>
            {label(r)} · {rows.filter((u) => u.role === r).length}
          </div>
        ))}
      </div>

      {/* search */}
      <div className="mb-4 flex max-w-sm items-center gap-2 rounded-full border border-[#1c3fbd]/15 bg-white px-4 py-2">
        <FaSearch className="text-[#1c3fbd]" size={13} />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or User ID…" className="w-full bg-transparent text-sm outline-none" />
      </div>

      {/* table */}
      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-grey bg-body">
              {["Name", "User ID", "Role", "Actions"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-dark-grey ${i === 3 ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-dark-grey">No users found.</td></tr>
            ) : filtered.map((row) => {
              const isMe = row.id === me?.id;
              const privileged = ["admin", "super_admin"].includes(row.role);
              const lockedRole = isMe || (privileged && myRole !== "super_admin");
              const canManage = !privileged || myRole === "super_admin" || isMe;
              return (
                <tr key={row.id} className="border-b border-grey/50 transition hover:bg-body/50">
                  <td className="px-4 py-3 font-medium">{row.name || "—"}{isMe && <span className="ml-2 text-xs text-dark-grey">(you)</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text_color2">{row.username || row.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={row.role}
                      disabled={lockedRole}
                      onChange={(e) => handleRoleChange(row, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize outline-none disabled:cursor-not-allowed ${ROLE_BADGE[row.role] || "bg-grey text-dark-grey"}`}
                    >
                      {(myRole === "super_admin" ? ["student", "teacher", "admin", "super_admin"] : ["student", "teacher", row.role])
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((r) => <option key={r} value={r}>{label(r)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openReset(row)} disabled={!canManage}
                      className="mr-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1c3fbd] hover:bg-[#1c3fbd]/10 disabled:opacity-40">
                      <FaKey size={11} /> Reset password
                    </button>
                    <button onClick={() => handleDelete(row)} disabled={isMe || !canManage}
                      className="rounded-lg p-1.5 text-buttons_1 hover:bg-buttons_1/10 disabled:opacity-30" aria-label="Delete">
                      <FaTrash size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Create login ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Login">
        <form onSubmit={handleCreate} className="p-6">
          <div className="flex flex-col gap-4">
            <FormField label="Account type" required>
              <select value={f.role} onChange={(e) => set({ role: e.target.value, studentId: "" })} className={FIELD}>
                {creatableRoles.map((r) => <option key={r} value={r}>{label(r)}</option>)}
              </select>
            </FormField>

            {f.role === "student" && (
              <FormField label="Link to student record (optional)">
                <select value={f.studentId} onChange={(e) => pickStudent(e.target.value)} className={FIELD}>
                  <option value="">— Not linked —</option>
                  {unlinked.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.enrollment_no ? ` (${s.enrollment_no})` : ""}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-dark-grey">
                  Linking makes this student&apos;s courses, attendance and results appear in their portal.
                  {unlinked.length === 0 && " (All students already have a login.)"}
                </p>
              </FormField>
            )}

            <FormField label="Full name" required>
              <input value={f.name} onChange={(e) => set({ name: e.target.value })} className={FIELD} placeholder="Student name" />
            </FormField>

            <FormField label="User ID" required>
              <input
                value={f.username}
                onChange={(e) => set({ username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                className={`${FIELD} font-mono`}
                placeholder="e.g. siit-2024-001"
                autoCapitalize="none"
              />
              <p className="mt-1 text-xs text-dark-grey">Small letters, numbers, dot, dash or underscore. 3–32 characters.</p>
            </FormField>

            <FormField label="Password" required>
              <PasswordField value={f.password} onChange={(v) => set({ password: v })} />
              <p className="mt-1 text-xs text-dark-grey">At least 6 characters. You will see it only once after creating.</p>
            </FormField>

            <FormField label="Phone (optional)">
              <input value={f.phone} onChange={(e) => set({ phone: e.target.value })} className={FIELD} placeholder="Phone number" />
            </FormField>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-full border border-grey px-5 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-dark text-sm disabled:opacity-60">
              {saving ? "Creating…" : "Create Login"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Reset password ── */}
      <Modal open={Boolean(resetFor)} onClose={() => setResetFor(null)} title="Reset password">
        <form onSubmit={handleReset} className="p-6">
          <p className="mb-4 text-sm text-text_color2">
            Set a new password for <span className="font-semibold text-text_color1">{resetFor?.name}</span>
            {" "}(<span className="font-mono">{resetFor?.username || resetFor?.email}</span>).
          </p>
          <FormField label="New password" required>
            <PasswordField value={newPw} onChange={setNewPw} />
          </FormField>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setResetFor(null)} className="rounded-full border border-grey px-5 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-dark text-sm disabled:opacity-60">
              {saving ? "Saving…" : "Reset password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Credentials (shown once) ── */}
      <Modal open={Boolean(creds)} onClose={() => setCreds(null)} title={creds?.kind === "reset" ? "Password changed" : "Login created"}>
        {creds && (
          <div className="p-6">
            <p className="mb-4 text-sm text-text_color2">
              Give these details to <span className="font-semibold text-text_color1">{creds.name}</span>.
              The password <span className="font-semibold">cannot be viewed again</span> — if it is forgotten, use Reset password.
            </p>
            <div className="rounded-xl bg-body p-4 font-mono text-sm">
              <div className="flex justify-between gap-3 py-1"><span className="text-dark-grey">User ID</span><span className="break-all font-semibold">{creds.username}</span></div>
              <div className="flex justify-between gap-3 py-1"><span className="text-dark-grey">Password</span><span className="break-all font-semibold">{creds.password}</span></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => copy(shareText(creds))} className="btn-dark inline-flex items-center gap-2 text-sm">
                <FaCopy size={12} /> Copy details
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText(creds))}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2 text-sm font-semibold text-white">
                <FaWhatsapp size={14} /> Send on WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
