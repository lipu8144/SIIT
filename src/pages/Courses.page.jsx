import { useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaStar,
  FaArrowRight,
  FaTimes,
  FaWhatsapp,
  FaCode,
  FaTable,
  FaBrush,
  FaCalculator,
  FaLaptop,
  FaCoffee,
} from "react-icons/fa";

import Loader from "../components/Loader";
import { UserContext } from "../App";
import EnrolePopup from "../components/EnrolePopup";
import { courseManagementService } from "../services/erpDb";

/**
 * SIIT — Courses page (premium upgrade)
 * Drop-in replacement for src/pages/Courses.page.jsx.
 * Same data contract: { id, thumbnail, course_name, category }.
 * Brand tokens only (buttons_1/2, twitter, text_color2, body, #1c3fbd).
 * Also exports default (the previous file was lazy-imported as default
 * but only had a named export — that latent bug is fixed here).
 */

/* per-category accent (uses your existing brand hues) + icon fallback */
const CAT = {
  Computer: { tint: "#1c3fbd", Icon: FaLaptop },
  "MS-Office": { tint: "#1DA1F2", Icon: FaTable },
  Design: { tint: "#eb0249", Icon: FaBrush },
  Account: { tint: "#f18032", Icon: FaCalculator },
  Programming: { tint: "#8B46FF", Icon: FaCode },
};
const catMeta = (c) => CAT[c] || { tint: "#1c3fbd", Icon: FaCode };

/* mark popular courses (no data change required) */
const POPULAR = new Set(["OS-CIT", "Advanced Excel", "Photoshop", "Tally with GST"]);

export const Courses = () => {
  useEffect(() => {
    document.title = "SIIT | Courses";
  }, []);

  const [courses, setCourses] = useState(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All Courses");
  const [selected, setSelected] = useState(null);

  const { setShowPopup, showPopup } = useContext(UserContext);

  useEffect(() => {
    (async () => {
      try {
        // Live catalog — reflects everything managed in Admin > Courses
        const rows = await courseManagementService.list();
        setCourses(
          rows
            .filter((c) => c.status !== "inactive")
            .map((c) => ({
              id: c.id,
              course_name: c.name,
              category: c.category,
              thumbnail: c.thumbnail || null,
              duration_months: c.duration_months,
              fee: c.fee,
              seats: c.seats,
              enrolled: c.enrolled,
            }))
        );
      } catch (e) {
        console.error("Failed to load courses:", e);
        setCourses([]);
      }
    })();
  }, []);

  const categories = useMemo(
    () => ["All Courses", ...new Set((courses || []).map((c) => c.category))],
    [courses]
  );

  const filtered = useMemo(() => {
    if (!courses) return [];
    const q = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (activeCat === "All Courses" || c.category === activeCat) &&
        c.course_name.toLowerCase().includes(q)
    );
  }, [courses, query, activeCat]);

  /* close modal on Escape */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!courses) return <Loader />;

  return (
    <>
      <section className="py-10">
        <h1 className="text-center text-4xl font-medium md:text-5xl">
          Our <span className="text-buttons_1">Courses</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-text_color2">
          Career-oriented certification programs — search and filter to find your path.
        </p>

        {/* search */}
        <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-[#1c3fbd]/15 bg-white px-4 py-2.5">
          <FaSearch className="text-[#1c3fbd]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            className="w-full bg-transparent text-base outline-none"
          />
        </div>

        {/* category chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                activeCat === c
                  ? "border-[#1c3fbd] bg-[#1c3fbd] text-white"
                  : "border-[#1c3fbd]/20 bg-white text-[#1c3fbd] hover:bg-[#1c3fbd]/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* grid */}
        <motion.div layout className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((course, i) => {
              const { tint, Icon } = catMeta(course.category);
              const popular = POPULAR.has(course.course_name);
              return (
                <motion.button
                  layout
                  key={course.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: (i % 8) * 0.04 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelected(course)}
                  className="group relative rounded-2xl border border-transparent bg-white p-3 text-left transition-shadow hover:border-[#1c3fbd]/25 hover:shadow-[0_16px_34px_rgba(28,63,189,0.18)]"
                >
                  {popular && (
                    <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-buttons_1 px-2 py-1 text-[10px] font-medium text-white">
                      <FaStar size={9} /> Popular
                    </span>
                  )}
                  <div
                    className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl"
                    style={{ background: `${tint}14` }}
                  >
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.course_name}
                        loading="lazy"
                        className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <Icon size={30} style={{ color: tint }} />
                    )}
                  </div>
                  <div className="text-xs font-medium" style={{ color: tint }}>
                    {course.category}
                  </div>
                  <div className="mb-2 text-base font-bold">{course.course_name}</div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[#1c3fbd]">
                    View details <FaArrowRight size={11} />
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-text_color2">No courses match your search.</p>
        )}
      </section>

      {/* details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white"
            >
              {(() => {
                const { tint, Icon } = catMeta(selected.category);
                return (
                  <>
                    <div className="relative p-6 text-white" style={{ background: tint }}>
                      <Icon size={34} />
                      <div className="mt-2 text-xs opacity-85">{selected.category}</div>
                      <div className="text-2xl font-medium">{selected.course_name}</div>
                      <button
                        onClick={() => setSelected(null)}
                        aria-label="Close"
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="p-6">
                      <p className="text-sm leading-relaxed text-text_color2">
                        Industry-aligned, certified {selected.course_name} training with hands-on
                        practice, real projects and placement support.
                      </p>
                      <div className="my-4 flex gap-6 text-sm">
                        <div>
                          <div className="text-text_color2">Duration</div>
                          <div className="font-medium">3 months</div>
                        </div>
                        <div>
                          <div className="text-text_color2">Level</div>
                          <div className="font-medium">Beginner</div>
                        </div>
                        <div>
                          <div className="text-text_color2">Mode</div>
                          <div className="font-medium">Offline</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelected(null);
                            setShowPopup(true);
                          }}
                          className="btn-dark flex-1 text-base"
                        >
                          Enrol Now
                        </button>
                        <a
                          href="https://wa.me/910000000000"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center rounded-full border border-[#25D366] px-4 py-2 text-[#128C3E]"
                          aria-label="Chat on WhatsApp"
                        >
                          <FaWhatsapp size={20} />
                        </a>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPopup && <EnrolePopup />}
    </>
  );
};

export default Courses;
