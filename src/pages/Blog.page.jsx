import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaStar, FaArrowRight, FaRegNewspaper } from "react-icons/fa";

import Reveal from "../common/Reveal";
import Loader from "../components/Loader";
import { blogService } from "../services/db";

/**
 * SIIT — Blog list page (Phase 2, DB-backed via service layer)
 * Replaces the coming-soon stub. Data comes from blogService, which
 * serves dummy data now and Supabase later (no change here).
 */

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const COVER_TINT = { Career: "#1c3fbd", Tutorials: "#f18032", Placements: "#eb0249" };
const tintOf = (c) => COVER_TINT[c] || "#1c3fbd";

export const Blog = () => {
  useEffect(() => {
    document.title = "SIIT | Blog";
  }, []);

  const [posts, setPosts] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [cats, setCats] = useState(["All"]);
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [all, feat, categories] = await Promise.all([
        blogService.list({ status: "published" }),
        blogService.featured(),
        blogService.categories(),
      ]);
      setPosts(all);
      setFeatured(feat);
      setCats(categories);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!posts) return [];
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (activeCat === "All" || p.category === activeCat) &&
        (p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
    );
  }, [posts, activeCat, query]);

  if (!posts) return <Loader />;

  return (
    <section className="py-10">
      <Reveal>
        <h1 className="text-center text-4xl font-medium md:text-5xl">
          SIIT <span className="text-buttons_1">Blog</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-text_color2">
          Tips, guides and stories from our institute.
        </p>
      </Reveal>

      {/* featured */}
      {featured && (
        <Reveal className="mx-auto mt-8 max-w-4xl">
          <Link
            to={`/blog/${featured.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white md:flex-row"
          >
            <div
              className="flex h-40 items-center justify-center overflow-hidden text-white md:h-auto md:w-72 md:shrink-0"
              style={{ background: `linear-gradient(135deg, ${tintOf(featured.category)}, #3457d6)` }}
            >
              {featured.cover_url ? (
                <img src={featured.cover_url} alt={featured.title} className="h-full w-full object-cover" />
              ) : (
                <FaStar size={40} />
              )}
            </div>
            <div className="p-6">
              <span className="rounded-full bg-buttons_1/10 px-3 py-1 text-xs font-medium text-buttons_1">
                FEATURED · {featured.category}
              </span>
              <h2 className="mt-2 text-2xl font-bold group-hover:text-[#1c3fbd]">{featured.title}</h2>
              <p className="mt-2 text-text_color2">{featured.excerpt}</p>
              <div className="mt-3 text-sm text-dark-grey">
                By {featured.author} · {fmtDate(featured.publish_at)}
              </div>
            </div>
          </Link>
        </Reveal>
      )}

      {/* search */}
      <div className="mx-auto mt-10 flex max-w-md items-center gap-2 rounded-full border border-[#1c3fbd]/15 bg-white px-4 py-2.5">
        <FaSearch className="text-[#1c3fbd]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="w-full bg-transparent text-base outline-none"
        />
      </div>

      {/* categories */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {cats.map((c) => (
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
      <motion.div layout className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
            >
              <Link
                to={`/blog/${p.slug}`}
                className="group block overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-[0_14px_30px_rgba(28,63,189,0.16)]"
              >
                <div
                  className="flex h-36 items-center justify-center overflow-hidden"
                  style={{ background: `${tintOf(p.category)}14` }}
                >
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <FaRegNewspaper size={30} style={{ color: tintOf(p.category) }} />
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium" style={{ color: tintOf(p.category) }}>
                    {p.category}
                  </span>
                  <h3 className="my-1 font-bold leading-snug group-hover:text-[#1c3fbd]">{p.title}</h3>
                  <p className="text-sm text-text_color2 line-clamp-2">{p.excerpt}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-dark-grey">
                    <span>
                      {p.author} · {fmtDate(p.publish_at)}
                    </span>
                    <FaArrowRight className="text-[#1c3fbd]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-text_color2">No articles match your search.</p>
      )}
    </section>
  );
};

export default Blog;
