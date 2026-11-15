import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaRegNewspaper } from "react-icons/fa";

import Reveal from "../common/Reveal";
import Loader from "../components/Loader";
import { blogService } from "../services/db";

/**
 * SIIT — Blog detail page (Phase 2, DB-backed)
 * Route: <Route path="/blog/:slug" element={<BlogDetail />} />
 */

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined = loading, null = not found
  const [related, setRelated] = useState([]);

  useEffect(() => {
    (async () => {
      const p = await blogService.getBySlug(slug);
      setPost(p && (!p.status || p.status === "published") ? p : null);
      if (p) {
        document.title = `SIIT | ${p.title}`;
        setRelated(await blogService.related(p.slug, p.category));
      }
    })();
  }, [slug]);

  if (post === undefined) return <Loader />;

  if (post === null) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-3xl font-bold">Article not found</h1>
        <Link to="/blog" className="btn-dark mt-6 inline-block">
          Back to Blog
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl py-10">
      <Link to="/blog" className="inline-flex items-center gap-2 text-[#1c3fbd] hover:underline">
        <FaArrowLeft size={13} /> Back to Blog
      </Link>

      <Reveal className="mt-6">
        <span className="rounded-full bg-buttons_1/10 px-3 py-1 text-xs font-medium text-buttons_1">
          {post.category}
        </span>
        <h1 className="mt-3 text-4xl font-bold leading-tight">{post.title}</h1>
        <div className="mt-3 text-sm text-dark-grey">
          By {post.author} · {fmtDate(post.publish_at)}
        </div>
      </Reveal>

      {post.cover_url ? (
        <Reveal index={1} className="mt-6 overflow-hidden rounded-2xl bg-grey">
          <img
            src={post.cover_url}
            alt={post.title}
            className="aspect-[1200/630] w-full object-cover"
          />
        </Reveal>
      ) : (
        <Reveal index={1} className="mt-6 h-52 rounded-2xl bg-gradient-to-br from-[#1c3fbd] to-[#3457d6]" />
      )}

      <Reveal index={2} className="prose mt-8 max-w-none text-lg leading-relaxed text-text_color1">
        {post.body.split("\n\n").map((para, i) => (
          <p key={i} className="mb-4">
            {para}
          </p>
        ))}
      </Reveal>

      {post.tags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-grey px-3 py-1 text-sm text-dark-grey">
              #{t}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-2xl font-bold">
            Related <span className="text-buttons_1">Articles</span>
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/blog/${r.slug}`}
                className="group block overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-[0_14px_30px_rgba(28,63,189,0.16)]"
              >
                <div className="flex h-20 items-center justify-center bg-[#1c3fbd]/10">
                  <FaRegNewspaper size={24} className="text-[#1c3fbd]" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold leading-snug group-hover:text-[#1c3fbd]">{r.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-dark-grey">
                    {fmtDate(r.publish_at)} <FaArrowRight className="text-[#1c3fbd]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogDetail;
