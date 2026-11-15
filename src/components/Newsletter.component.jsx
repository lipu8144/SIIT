import { useState } from "react";
import toast from "react-hot-toast";
import { FaPaperPlane } from "react-icons/fa";
import Reveal from "../common/Reveal";
import { leadService } from "../services/growthDb";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      // Capture the subscriber as a lead so the institute sees signups
      // in Admin → Leads (source: newsletter).
      await leadService.create({
        name: "",
        phone: "",
        email,
        course_interest: "Newsletter subscription",
        remarks: "Subscribed via newsletter",
        status: "new",
        source: "newsletter",
      });
      toast.success("You're subscribed! Check your inbox.");
      setEmail("");
    } catch (_) {
      toast.error("Couldn't subscribe right now. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section container-x">
      <Reveal className="relative overflow-hidden rounded-3xl bg-overlay px-6 py-12 text-white sm:px-12">
        {/* ambient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(235,2,73,.45),transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 left-0 h-44 w-44 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(241,128,50,.45),transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Get course updates & free workshops
          </h2>
          <p className="mt-3 text-white/80">
            Join our newsletter for new batches, scholarships, and career tips —
            no spam, unsubscribe anytime.
          </p>

          <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@example.com"
              className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder-white/50 outline-none focus:border-white"
            />
            <button
              onClick={handleSubmit}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-buttons_1 px-6 py-3 font-semibold text-white transition hover:bg-buttons_1/90 disabled:opacity-60"
            >
              {busy ? "Subscribing…" : "Subscribe"} <FaPaperPlane size={13} />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default Newsletter;
