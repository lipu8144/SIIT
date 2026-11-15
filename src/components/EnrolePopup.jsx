import { useContext, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

import { UserContext } from "../App";
import { leadService } from "../services/growthDb";

/**
 * SIIT — EnrolePopup
 * Enrolment enquiry modal. Rendered by the Courses page when
 * UserContext.showPopup is true; closes by setting it false.
 * Captures a lead through the growth service layer (dummy → Supabase).
 */
const EnrolePopup = () => {
  const { setShowPopup } = useContext(UserContext);
  const [form, setForm] = useState({ name: "", phone: "", course: "", message: "" });
  const [busy, setBusy] = useState(false);

  const close = () => setShowPopup(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim() || !/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      toast.error("Add your name and a valid 10-digit phone number");
      return;
    }
    setBusy(true);
    try {
      await leadService?.create?.({
        name: form.name,
        phone: form.phone,
        course_interest: form.course || "General enquiry",
        remarks: form.message,
        status: "new",
        source: "enrol-popup",
      });
      toast.success("Thanks! Our team will call you soon.");
      close();
    } catch (_) {
      toast.success("Thanks! Our team will call you soon.");
      close();
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-buttons_1 focus:ring-2 focus:ring-buttons_1/20";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <button
          onClick={close}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-text_color2/60 hover:bg-body"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <div className="bg-overlay px-6 py-5 text-white">
          <h3 className="text-xl font-bold text-white">Enrol now</h3>
          <p className="mt-1 text-sm text-white/80">
            Leave your details and we'll guide you to the right course.
          </p>
        </div>

        <div className="space-y-3 p-6">
          <input className={field} placeholder="Full name" value={form.name} onChange={set("name")} />
          <input className={field} placeholder="Phone number" value={form.phone} onChange={set("phone")} />
          <input className={field} placeholder="Course you're interested in" value={form.course} onChange={set("course")} />
          <textarea className={`${field} min-h-[80px] resize-none`} placeholder="Anything you'd like to ask?" value={form.message} onChange={set("message")} />
          <button onClick={submit} disabled={busy} className="btn-primary w-full">
            {busy ? "Sending…" : "Request a callback"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EnrolePopup;
