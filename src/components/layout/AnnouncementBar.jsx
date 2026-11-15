import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBullhorn, FaTimes } from "react-icons/fa";
import { isLive } from "../../lib/liveWindow";

/**
 * SIIT — AnnouncementBar
 * Top, dismissible announcement bar. Render it ABOVE <Navbar /> in App.jsx.
 *
 * Data shape (later served from Supabase `notifications` table):
 *   { id, type, message, ctaLabel?, ctaHref?, active, startsAt?, endsAt? }
 *   type ∈ 'admission' | 'event' | 'exam' | 'general'
 *
 * Behaviour: shows the first active announcement that is within its
 * schedule window and not previously dismissed (remembered in localStorage).
 */

const TYPE_STYLE = {
  admission: { from: "#eb0249", to: "#f18032", icon: FaBullhorn },
  event: { from: "#1c3fbd", to: "#1DA1F2", icon: FaBullhorn },
  exam: { from: "#8B46FF", to: "#1c3fbd", icon: FaBullhorn },
  general: { from: "#42506a", to: "#1c3fbd", icon: FaBullhorn },
};

/* TODO(Phase 2): replace with data from Supabase `notifications`. */
const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "adm-2026",
    type: "admission",
    message: "Admissions Open 2026 — new OS-CIT batch starts July 1.",
    ctaLabel: "Apply now",
    ctaHref: "/courses",
    active: true,
  },
];

const within = (a) => isLive(a);

const AnnouncementBar = ({ announcements = DEFAULT_ANNOUNCEMENTS }) => {
  const [dismissed, setDismissed] = useState([]); // ids closed during this visit
  const [idx, setIdx] = useState(0);

  const live = useMemo(
    () =>
      announcements.filter((a) => {
        if (!a.active || !within(a) || dismissed.includes(a.id)) return false;
        try {
          return localStorage.getItem(`siit_ann_dismissed_${a.id}`) !== "1";
        } catch {
          return true;
        }
      }),
    [announcements, dismissed]
  );

  // When several notices are live they take turns, every 6 seconds
  useEffect(() => {
    if (live.length < 2) return undefined;
    const t = setInterval(() => setIdx((i) => i + 1), 6000);
    return () => clearInterval(t);
  }, [live.length]);

  if (live.length === 0) return null;

  const current = live[idx % live.length];
  const style = TYPE_STYLE[current.type] || TYPE_STYLE.general;
  const Icon = style.icon;

  const dismiss = () => {
    try {
      localStorage.setItem(`siit_ann_dismissed_${current.id}`, "1");
    } catch {}
    setDismissed((d) => [...d, current.id]);
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="relative z-40 px-12 py-2.5 text-center text-sm text-white"
      style={{ background: `linear-gradient(90deg, ${style.from}, ${style.to})` }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <Icon className="hidden sm:block" />
          <span className="font-medium">{current.message}</span>
          {current.ctaLabel && (
            current.ctaHref?.startsWith("http") ? (
              <a
                href={current.ctaHref}
                target="_blank" rel="noreferrer"
                className="rounded-full bg-white/20 px-3 py-0.5 font-medium hover:bg-white/30"
              >
                {current.ctaLabel}
              </a>
            ) : (
              <Link
                to={current.ctaHref || "/"}
                className="rounded-full bg-white/20 px-3 py-0.5 font-medium hover:bg-white/30"
              >
                {current.ctaLabel}
              </Link>
            )
          )}
        </motion.div>
      </AnimatePresence>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
      >
        <FaTimes />
      </button>
    </motion.div>
  );
};

export default AnnouncementBar;
