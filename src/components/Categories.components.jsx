import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileExcel,
  FaCalculator,
  FaPaintBrush,
  FaCode,
  FaKeyboard,
  FaGraduationCap,
} from "react-icons/fa";
import Reveal from "../common/Reveal";
import { courseManagementService } from "../services/erpDb";

/* Icon per category name — falls back to the graduation cap */
const ICONS = {
  "Computer": FaGraduationCap,
  "MS-Office": FaFileExcel,
  "Account": FaCalculator,
  "Accounting": FaCalculator,
  "Design": FaPaintBrush,
  "Graphic Design": FaPaintBrush,
  "Programming": FaCode,
  "Data Entry": FaKeyboard,
};

export const Categories = () => {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    // Categories and counts are derived from the live course catalog
    courseManagementService.list().then((rows) => {
      const active = rows.filter((c) => c.status !== "inactive");
      const map = {};
      active.forEach((c) => { map[c.category] = (map[c.category] || 0) + 1; });
      setCats(
        Object.entries(map).map(([label, n]) => ({
          label,
          Icon: ICONS[label] || FaGraduationCap,
          count: `${n} course${n === 1 ? "" : "s"}`,
        }))
      );
    });
  }, []);

  return (
    <section className="section bg-white">
      <div className="container-x">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-buttons_1">
              Explore by category
            </p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Find the right track for you
            </h2>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-buttons_1 hover:underline">
            View all courses →
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((c, i) => (
            <Reveal key={c.label} index={i}>
              <Link
                to="/courses"
                className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-body p-5 text-center transition hover:border-buttons_1/30 hover:bg-white hover:shadow-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-buttons_2 shadow-sm transition group-hover:bg-buttons_2 group-hover:text-white">
                  <c.Icon size={20} />
                </span>
                <span className="text-sm font-semibold text-[#1b2447]">
                  {c.label}
                </span>
                <span className="text-xs text-text_color2/60">{c.count}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
