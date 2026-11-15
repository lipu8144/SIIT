import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

/**
 * SIIT — Popup
 * Promotional popup with three layouts: 'modal' | 'side' | 'bottom'.
 * Auto-opens after `delayMs` on first visit; "Don't show again" persists
 * via localStorage. Plain close (X) only hides for the session.
 *
 * Config (later served from Supabase, e.g. a `popups` row):
 *   { id, variant, badge?, title, text, image?, ctaLabel?, ctaHref?,
 *     active, startsAt?, endsAt?, delayMs? }
 *
 * Usage in App.jsx (anywhere; it positions itself):  <Popup />
 */

/* TODO(Phase 2): replace with data from Supabase. */
const DEFAULT_POPUP = {
  id: "adm-2026-modal",
  variant: "modal",
  badge: "NEW BATCH",
  title: "Admissions Open 2026",
  text:
    "Limited seats for OS-CIT, Tally + GST and Advanced Excel. Enrol early and save on the registration fee.",
  image: null, // pass an imported image or URL; falls back to a brand panel
  ctaLabel: "Enrol Now",
  ctaHref: "/courses",
  active: true,
  delayMs: 1200,
};

const within = (p) => {
  const now = Date.now();
  if (p.startsAt && now < new Date(p.startsAt).getTime()) return false;
  if (p.endsAt && now > new Date(p.endsAt).getTime()) return false;
  return true;
};

const variantMotion = {
  modal: {
    wrap: "fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4",
    initial: { scale: 0.92, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.92, opacity: 0, y: 20 },
    card: "w-full max-w-sm",
  },
  side: {
    wrap: "fixed bottom-5 right-5 z-50 max-w-xs",
    initial: { x: 120, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 120, opacity: 0 },
    card: "w-full",
  },
  bottom: {
    wrap: "fixed bottom-0 left-0 z-50 w-full p-3",
    initial: { y: 120, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 120, opacity: 0 },
    card: "mx-auto w-full max-w-lg",
  },
};

const Popup = ({ config = DEFAULT_POPUP }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!config?.active || !within(config)) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(`siit_popup_dismissed_${config.id}`) === "1";
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setOpen(true), config.delayMs ?? 1000);
    return () => clearTimeout(t);
  }, [config]);

  if (!config) return null;
  const v = variantMotion[config.variant] || variantMotion.modal;

  const close = () => setOpen(false);
  const neverShow = () => {
    try {
      localStorage.setItem(`siit_popup_dismissed_${config.id}`, "1");
    } catch {}
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={v.wrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={config.variant === "modal" ? close : undefined}
        >
          <motion.div
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative overflow-hidden rounded-2xl bg-white shadow-2xl ${v.card}`}
          >
            <button
              onClick={close}
              aria-label="Close popup"
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/50"
            >
              <FaTimes size={13} />
            </button>

            {/* image / brand panel */}
            {config.image ? (
              <img src={config.image} alt={config.title} className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#1c3fbd] to-[#3457d6] text-white">
                <span className="font-gelasio text-3xl">
                  S<span className="text-[#ff7ba1]">i</span>
                  <span className="text-[#ffc59a]">i</span>
                  <span className="text-[#a9e0ff]">T</span>
                </span>
              </div>
            )}

            <div className="p-5 text-center">
              {config.badge && (
                <span className="mb-2 inline-block rounded-full bg-buttons_1/10 px-3 py-1 text-xs font-medium text-buttons_1">
                  {config.badge}
                </span>
              )}
              <h3 className="mb-1.5 text-lg font-medium">{config.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-text_color2">{config.text}</p>
              {config.ctaLabel && (
                config.ctaHref?.startsWith("http") ? (
                  <a href={config.ctaHref} onClick={close} target="_blank" rel="noreferrer"
                    className="btn-dark block w-full text-center text-base">
                    {config.ctaLabel}
                  </a>
                ) : (
                  <Link to={config.ctaHref || "/"} onClick={close}
                    className="btn-dark block w-full text-center text-base">
                    {config.ctaLabel}
                  </Link>
                )
              )}
              <button onClick={neverShow} className="mt-3 text-xs text-dark-grey hover:underline">
                Don&apos;t show again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
