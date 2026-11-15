import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaChalkboardTeacher, FaHandHoldingUsd, FaUsers,
  FaArrowRight, FaQuoteLeft,
} from "react-icons/fa";

import Reveal from "../common/Reveal";
import { teacherService } from "../services/erpDb";
import about1 from "../assets/about1.jpg";
import about2 from "../assets/about2.png";
import join_us from "../assets/join_us.jpg";

/**
 * SIIT — About page (rebuilt)
 * Consistent container widths, proper vertical rhythm, brand tokens only.
 * Sections: hero band · why-us · journey timeline ·
 * mission/programs split · founder note · faculty · join CTA.
 */

const WHY = [
  { Icon: FaChalkboardTeacher, tint: "#eb0249", title: "Expert Instructors",
    text: "Experienced, passionate trainers who bring real-world knowledge into every class." },
  { Icon: FaHandHoldingUsd, tint: "#1DA1F2", title: "Affordable Education",
    text: "High-quality, government-recognised training that stays within reach of every family." },
  { Icon: FaUsers, tint: "#f18032", title: "Supportive Community",
    text: "A place where students connect, collaborate, and grow together toward their goals." },
];

const JOURNEY = [
  { year: "2019", title: "Founded", text: "SIIT opens as a small computer training centre in Sorada.", color: "#1c3fdb" },
  { year: "2019", title: "Government partner", text: "Authorised centre for OS-CIT and recognised programmes.", color: "#f18032" },
  { year: "2019", title: "ISO certified", text: "Quality systems certified to ISO 9001:2015.", color: "#eb0249" },
  { year: "2026", title: "1000+ certified", text: "Crossed 1000 certified students with strong placement support.", color: "#1DA1F2" },
];

const FACULTY_COLORS = ["#1c3fdb", "#f18032", "#eb0249", "#1DA1F2", "#8B46FF"];

/* Build display initials from a teacher's name, e.g. "A. Mishra" → "AM" */
const initialsOf = (name = "") =>
  name.replace(/[^a-zA-Z ]/g, "").split(/\s+/).filter(Boolean)
    .map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

/* Reusable section heading with an eyebrow label */
const Heading = ({ eyebrow, children, center }) => (
  <div className={center ? "text-center" : ""}>
    {eyebrow && (
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-buttons_1">{eyebrow}</p>
    )}
    <h2 className="text-3xl font-extrabold text-text_color1 sm:text-4xl">{children}</h2>
  </div>
);

export const About = () => {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    document.title = "SIIT | About";
    // "Our Team" is driven by the Teachers records managed in Admin → Teachers
    teacherService.list().then((rows) => {
      setFaculty(
        (rows || [])
          .filter((t) => t.status !== "inactive")
          .map((t, i) => ({
            initials: initialsOf(t.name),
            name: t.name,
            subject: Array.isArray(t.subjects) ? t.subjects.slice(0, 2).join(", ") : (t.subjects || "Faculty"),
            color: FACULTY_COLORS[i % FACULTY_COLORS.length],
          }))
      );
    });
  }, []);

  return (
    <div className="pb-4">
      {/* ── Hero band ── */}
      <section className="relative overflow-hidden bg-overlay">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(235,2,73,.5),transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(241,128,50,.45),transparent 70%)" }}
        />
        <div className="container-x relative py-20 text-center sm:py-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70"
          >
            Smart Institute of Information Technology
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl"
          >
            Practical IT education that changes futures
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-4 max-w-2xl text-white/80"
          >
            Since 2019, SIIT has helped students in Sorada and beyond build real, job-ready
            computer skills through hands-on, affordable, government-recognised training.
          </motion.p>
        </div>
      </section>

      {/* ── Why choose us ── */}
      <section className="container-x py-16 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Heading eyebrow="Why SIIT" center>A learning experience built for results</Heading>
          <p className="mt-3 text-text_color2">
            Modern teaching methods, audio-visual lessons, and hands-on practice make learning
            easy, enjoyable, and genuinely useful.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {WHY.map((c, i) => (
            <Reveal key={c.title} index={i}
              className="rounded-2xl border border-black/5 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
                style={{ background: `${c.tint}14`, color: c.tint }}>
                <c.Icon size={24} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-text_color1">{c.title}</h3>
              <p className="mt-2 text-sm text-text_color2">{c.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Journey timeline (signature section) ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-x">
          <Reveal className="text-center">
            <Heading eyebrow="Our story" center>The SIIT journey</Heading>
          </Reveal>

          <div className="relative mx-auto mt-12 max-w-2xl">
            {/* vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-grey sm:left-1/2 sm:-ml-px" />
            {JOURNEY.map((j, i) => (
              <Reveal key={j.year} index={i}
                className={`relative mb-8 pl-12 last:mb-0 sm:w-1/2 sm:pl-0 ${
                  i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12"
                }`}>
                {/* dot */}
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full border-[3px] border-white shadow left-[8px] ${
                    i % 2 === 0 ? "sm:left-auto sm:-right-2" : "sm:-left-2"
                  }`}
                  style={{ background: j.color }}
                />
                <div className="text-sm font-bold" style={{ color: j.color }}>{j.year}</div>
                <div className="text-lg font-bold text-text_color1">{j.title}</div>
                <p className="mt-1 text-sm text-text_color2">{j.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission (image + text) ── */}
      <section className="container-x py-16 sm:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal className="overflow-hidden rounded-2xl">
            <img src={about1} alt="Students learning at SIIT" className="h-full w-full object-cover" />
          </Reveal>
          <Reveal index={1}>
            <Heading eyebrow="Our mission">Empowering students to thrive</Heading>
            <p className="mt-4 text-text_color2">
              At SIIT, our mission is to give students the knowledge, skills, and values they need
              to succeed in a fast-changing world. We build a vibrant learning community that
              promotes academic excellence, creativity, and social responsibility — so every
              student leaves ready for the workplace.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Academic programs (text + image, reversed) ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-x grid items-center gap-10 md:grid-cols-2">
          <Reveal className="order-2 md:order-1">
            <Heading eyebrow="What we teach">Academic programs</Heading>
            <p className="mt-4 text-text_color2">
              We offer a comprehensive range of courses designed for diverse interests and goals —
              from government certifications like OS-CIT to accounting, design, and programming.
              Our programs blend real-world application with hands-on practice so students are
              genuinely job-ready.
            </p>
            <Link to="/courses" className="btn-primary mt-6">
              Explore courses <FaArrowRight size={13} />
            </Link>
          </Reveal>
          <Reveal index={1} className="order-1 overflow-hidden rounded-2xl md:order-2">
            <img src={about2} alt="SIIT programs" className="h-full w-full object-cover" />
          </Reveal>
        </div>
      </section>

      {/* ── Founder's message ── */}
      <section className="container-x py-16 sm:py-20">
        <Reveal className="relative overflow-hidden rounded-3xl bg-overlay p-8 text-white sm:p-12">
          <FaQuoteLeft className="absolute right-8 top-8 text-white/10" size={72} />
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Founder&apos;s message</p>
          <p className="relative mt-4 max-w-3xl font-gelasio text-xl italic leading-relaxed text-white/95 sm:text-2xl">
            &ldquo;We started SIIT with one belief — that practical, affordable IT education can
            change a student&apos;s future. Every certificate we award is a step toward that
            promise.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 font-gelasio text-lg">JP</span>
            <div>
              <div className="font-semibold">Director</div>
              <div className="text-sm text-white/60">SIIT, Sorada</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Our team (from Admin → Teachers) ── */}
      {faculty.length > 0 && (
        <section className="container-x pb-16 sm:pb-20">
          <Reveal className="text-center">
            <Heading eyebrow="Our team" center>Meet the faculty</Heading>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {faculty.map((f, i) => (
              <Reveal key={`${f.initials}-${i}`} index={i}
                className="rounded-2xl border border-black/5 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-md">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-xl font-bold"
                  style={{ background: `${f.color}1a`, color: f.color }}>
                  {f.initials}
                </div>
                <div className="mt-3 font-semibold text-text_color1">{f.name}</div>
                <div className="text-sm text-text_color2">{f.subject}</div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Join us CTA ── */}
      <section className="container-x pb-4">
        <Reveal className="relative overflow-hidden rounded-3xl">
          <img src={join_us} alt="Join SIIT" className="h-64 w-full object-cover sm:h-80" />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-overlay/70 px-6 text-center">
            <h2 className="max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
              Ready to build your future with SIIT?
            </h2>
            <p className="mt-3 max-w-xl text-white/85">
              Whether you&apos;re a student, parent, or professional, we&apos;d love to welcome you.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/courses" className="btn-primary">Browse courses</Link>
              <Link to="/contact" className="rounded-full border-2 border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-overlay">
                Contact us
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default About;
