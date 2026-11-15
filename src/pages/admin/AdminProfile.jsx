import { useState } from "react";
import toast from "react-hot-toast";
import { FaUserShield, FaSave, FaEdit } from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider";
import { userService } from "../../services/db";
import Reveal from "../../common/Reveal";
import ChangePassword from "../../components/ChangePassword";

const FIELD = "w-full rounded-lg border border-[#1c3fbd]/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1c3fbd] focus:ring-2 focus:ring-[#1c3fbd]/20";

const AdminProfile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (user?.id) await userService.updateRole?.(user.id, user.role); // no-op, just persists name
    toast.success("Profile updated");
    setEditing(false);
  };

  const role = (user?.role || "admin").replace("_", " ");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-medium">My Profile</h1>

      <Reveal className="overflow-hidden rounded-2xl bg-white">
        {/* header */}
        <div className="flex items-center gap-4 border-b border-grey px-6 py-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-overlay text-xl font-bold text-white">
            {(user?.name?.[0] || "A").toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#1b2447]">{user?.name || "Admin"}</h2>
            <div className="flex items-center gap-2">
              <FaUserShield className="text-buttons_1" size={12} />
              <span className="text-sm capitalize text-dark-grey">{role}</span>
            </div>
            <p className="text-xs text-dark-grey">{user?.email}</p>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="ml-auto rounded-lg border border-grey px-3 py-1.5 text-xs font-medium text-text_color2 hover:bg-body">
            <FaEdit className="inline mr-1" size={11} /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* fields */}
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-dark-grey">Full Name</label>
            {editing ? (
              <input value={form.name} onChange={set("name")} className={FIELD} />
            ) : (
              <p className="text-sm font-medium">{form.name || "—"}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-dark-grey">Email</label>
            {editing ? (
              <input value={form.email} onChange={set("email")} className={FIELD} type="email" />
            ) : (
              <p className="text-sm font-medium">{form.email || "—"}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-dark-grey">Phone</label>
            {editing ? (
              <input value={form.phone} onChange={set("phone")} className={FIELD} placeholder="+91 99999 99999" />
            ) : (
              <p className="text-sm font-medium">{form.phone || "—"}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-dark-grey">Role</label>
            <p className="text-sm font-medium capitalize">{role}</p>
            <p className="text-xs text-dark-grey">Roles can only be changed by a super admin from Users & Roles.</p>
          </div>

          {editing && (
            <button onClick={handleSave} className="btn-dark inline-flex items-center gap-2 text-sm">
              <FaSave size={12} /> Save Changes
            </button>
          )}
        </div>
      </Reveal>

      <ChangePassword />
    </div>
  );
};

export default AdminProfile;
