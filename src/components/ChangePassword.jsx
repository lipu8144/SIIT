import { useState } from "react";
import toast from "react-hot-toast";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import { useAuth } from "../context/AuthProvider";

/**
 * SIIT — ChangePassword
 * Self-service password update, used on both the admin and
 * student profile pages.
 */
const FIELD =
  "w-full rounded-lg border border-[#1c3fbd]/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1c3fbd] focus:ring-2 focus:ring-[#1c3fbd]/20";

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ next: "", confirm: "" });

  const set = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (pw.next.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pw.next !== pw.confirm) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    try {
      await changePassword(pw.next);
      toast.success("Password updated");
      setPw({ next: "", confirm: "" });
      setOpen(false);
    } catch (err) {
      toast.error(err?.message || "Couldn't update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 overflow-hidden rounded-2xl bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-buttons_1/10">
            <FaLock className="text-buttons_1" size={14} />
          </span>
          <span>
            <span className="block font-medium">Password</span>
            <span className="block text-xs text-dark-grey">Change your account password</span>
          </span>
        </span>
        <span className="text-xs font-medium text-[#1c3fbd]">{open ? "Cancel" : "Change"}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-grey px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-dark-grey">New password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pw.next}
                onChange={set("next")}
                className={FIELD}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-grey"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-dark-grey">Confirm password</label>
            <input
              type={show ? "text" : "password"}
              value={pw.confirm}
              onChange={set("confirm")}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className={FIELD}
              placeholder="Re-enter the new password"
            />
          </div>

          <button onClick={submit} disabled={busy} className="btn-dark text-sm disabled:opacity-60">
            {busy ? "Updating…" : "Update password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
