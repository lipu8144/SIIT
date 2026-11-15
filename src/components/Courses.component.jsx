import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaClock } from "react-icons/fa";
import Reveal from "../common/Reveal";
import { courseManagementService } from "../services/erpDb";

/**
 * Homepage "popular courses" strip. Shows a curated subset and links to
 * the full /courses page. Default export (Home.page imports it default).
 */
const Courses = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Live — reflects courses managed in Admin > Courses
    courseManagementService.list().then((rows) => {
      setFeatured(rows.filter((c) => c.status !== "inactive").slice(0, 6));
    });
  }, []);

  return (
    <section className="section container-x">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-buttons_1">
          Popular courses
        </p>
        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Skills that get you hired
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((c, i) => (
          <Reveal
            key={c.id}
            index={i}
            className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              {c.thumbnail ? (
                <img
                  src={c.thumbnail}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-overlay to-[#0a1c78] font-gelasio text-3xl text-white/90">
                  {c.name?.[0] || "S"}
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-buttons_1">
                {c.category}
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-[#1b2447]">
                {c.name}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-text_color2/80">
                {c.category} · {c.seats - c.enrolled} seats left
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-text_color2/70">
                  <FaClock /> {c.duration_months} months
                </span>
                <span className="font-bold text-buttons_2">₹{c.fee?.toLocaleString?.('en-IN') ?? c.fee}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link to="/courses" className="btn-primary">
          Browse all courses <FaArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default Courses;
