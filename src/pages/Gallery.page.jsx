import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlay, FaImage } from "react-icons/fa";

import Reveal from "../common/Reveal";
import Loader from "../components/Loader";
import { galleryService } from "../services/db";

/**
 * SIIT — Gallery page (Phase 2, DB-backed)
 * Album filter + masonry (CSS columns) + lightbox. galleryService serves
 * dummy data now, Supabase Storage URLs later. Add route:
 *   <Route path="/gallery" element={<Gallery />} />
 *
 * When `url` is null (dummy), a coloured placeholder tile is shown; once
 * Supabase returns real URLs, the <img>/<video> renders instead.
 */

const TINTS = ["#1c3fbd", "#eb0249", "#f18032", "#1DA1F2", "#8B46FF"];
const tintFor = (id) => TINTS[(id?.charCodeAt?.(id.length - 1) || 0) % TINTS.length];

export const Gallery = () => {
  useEffect(() => {
    document.title = "SIIT | Gallery";
  }, []);

  const [items, setItems] = useState(null);
  const [albums, setAlbums] = useState(["All"]);
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    (async () => {
      const [all, al] = await Promise.all([
        galleryService.list({ status: null }),
        galleryService.albums(),
      ]);
      setItems(all);
      setAlbums(al);
    })();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(
    () => (items || []).filter((g) => active === "All" || g.album === active),
    [items, active]
  );

  if (!items) return <Loader />;

  const Tile = ({ g }) => {
    const tint = tintFor(g.id);
    return (
      <button
        onClick={() => setLightbox(g)}
        className="group relative block w-full overflow-hidden rounded-xl"
      >
        {/* fixed 4:3 frame keeps every tile the same size, centered */}
        <div className="relative aspect-[4/3] w-full">
          {g.url ? (
            g.type === "video" ? (
              <video src={g.url} className="absolute inset-0 h-full w-full object-cover" muted />
            ) : (
              <img
                src={g.url}
                alt={g.caption}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${tint}22, ${tint}0d)` }}
            >
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl"
                style={{ background: `${tint}1f`, color: tint }}
              >
                {g.type === "video" ? <FaPlay size={22} /> : <FaImage size={22} />}
              </span>
            </div>
          )}

          {/* caption */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 text-left text-xs font-medium text-white">
            {g.caption}
          </div>

          {/* video badge */}
          {g.type === "video" && (
            <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white">
              <FaPlay size={10} />
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <section className="py-10">
      <Reveal>
        <h1 className="text-center text-4xl font-medium md:text-5xl">
          SIIT <span className="text-buttons_1">Gallery</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-text_color2">
          Moments from our campus, classrooms and events.
        </p>
      </Reveal>

      {/* album filter */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {albums.map((a) => (
          <button
            key={a}
            onClick={() => setActive(a)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
              active === a
                ? "border-[#1c3fbd] bg-[#1c3fbd] text-white"
                : "border-[#1c3fbd]/20 bg-white text-[#1c3fbd] hover:bg-[#1c3fbd]/5"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((g) => (
          <Tile key={g.id} g={g} />
        ))}
      </div>

      {/* empty state */}
      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-dark-grey">
          No items in this album yet.
        </p>
      )}

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6"
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <FaTimes />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl"
            >
              {lightbox.url ? (
                lightbox.type === "video" ? (
                  <video src={lightbox.url} controls className="w-full" />
                ) : (
                  <img src={lightbox.url} alt={lightbox.caption} className="w-full" />
                )
              ) : (
                <div
                  className="flex h-72 items-center justify-center"
                  style={{ background: `${tintFor(lightbox.id)}33` }}
                >
                  {lightbox.type === "video" ? (
                    <FaPlay size={64} style={{ color: tintFor(lightbox.id) }} />
                  ) : (
                    <FaImage size={64} style={{ color: tintFor(lightbox.id) }} />
                  )}
                </div>
              )}
            </motion.div>
            <div className="mt-3 text-sm text-white">
              {lightbox.caption} · {lightbox.album}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
