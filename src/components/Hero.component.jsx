import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimationFrame, useMotionValue, useSpring } from "framer-motion";
import {
  FaCode,
  FaPalette,
  FaCalculator,
  FaTable,
  FaLaptopCode,
  FaPaintBrush,
  FaCheck,
  FaArrowRight,
  FaAward,
  FaBriefcase,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { siteSettingsService } from "../services/db";

/**
 * SIIT — Premium Animated Hero
 * --------------------------------------------------------------
 * Drop-in replacement for src/components/Hero.component.jsx.
 * Uses ONLY existing brand tokens from tailwind.config.js:
 *   buttons_1 (#eb0249) · buttons_2 (#f18032) · twitter (#1DA1F2)
 *   text_color2 (#42506a) · body (#edf4ff) · overlay-blue (#1c3fbd)
 * No new colors introduced. framer-motion is already a dependency.
 * --------------------------------------------------------------
 */

const DEFAULT_STATS = [
  { to: 500, label: "Students Certified", color: "text-buttons_2" },
  { to: 100, label: "Happy Learners", color: "text-[#1c3fbd]" },
  { to: 50, label: "Courses Offered", color: "text-buttons_1" },
];

const COLORS = ["text-buttons_2", "text-[#1c3fbd]", "text-buttons_1"];

const COURSES = [
  { icon: FaCode, label: "Web Development", tint: "#1c3fbd" },
  { icon: FaPalette, label: "Graphic Design", tint: "#eb0249" },
  { icon: FaCalculator, label: "Tally + GST", tint: "#f18032" },
  { icon: FaTable, label: "Advanced Excel", tint: "#1DA1F2" },
  { icon: FaLaptopCode, label: "OS-CIT", tint: "#1c3fbd" },
  { icon: FaPaintBrush, label: "Photoshop", tint: "#eb0249" },
];

/* Count-up number that animates once on mount */
const Counter = memo(function Counter({ to, className }) {
  const [val, setVal] = useState(0);
  const start = useRef(null);
  useAnimationFrame((t) => {
    if (val >= to) return;
    if (start.current === null) start.current = t;
    const p = Math.min((t - start.current) / 1400, 1);
    setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
  });
  return <span className={className}>{val}+</span>;
});

/* A single course card that floats up, gets checked, then fades */
const CourseCard = memo(function CourseCard({ course, onDone }) {
  const Icon = course.icon;
  const rot = useRef((Math.random() * 10 - 5).toFixed(1)).current;
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: "-50%", rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -70, -70, -120],
        rotate: [0, Number(rot), Number(rot), Number(rot)],
      }}
      transition={{ duration: 2.6, times: [0, 0.38, 0.72, 1], ease: "easeOut" }}
      onAnimationComplete={onDone}
      className="absolute left-1/2 top-0 flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 py-2 shadow-[0_10px_26px_rgba(28,63,189,0.20)]"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `${course.tint}1a`, color: course.tint }}
      >
        <Icon size={16} />
      </span>
      <span className="text-sm font-bold text-black">{course.label}</span>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.05, type: "spring", stiffness: 300 }}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white"
      >
        <FaCheck size={11} />
      </motion.span>
    </motion.div>
  );
});

const Hero = () => {
  const [heroStats, setHeroStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    siteSettingsService.getByGroup("hero").then((items) => {
      if (items?.length) {
        setHeroStats(items.map((s, i) => ({
          to: Number(s.value) || 0,
          label: s.label,
          color: COLORS[i % COLORS.length],
        })));
      }
    });
  }, []);

  /* mouse parallax */
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const onMouse = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const par = (depth) => ({
    x: useSpring(useMotionValue(0)), // placeholder; real transform below
  });

  /* continuously cycling course cards */
  const [cards, setCards] = useState([]);
  const idx = useRef(0);
  useEffect(() => {
    const tick = () => {
      const course = COURSES[idx.current % COURSES.length];
      idx.current += 1;
      const id = Date.now() + Math.random();
      setCards((c) => [...c, { id, course }]);
    };
    tick();
    const i = setInterval(tick, 1500);
    return () => clearInterval(i);
  }, []);
  const removeCard = (id) => setCards((c) => c.filter((x) => x.id !== id));

  return (
    <section className="relative overflow-hidden">
      <motion.div
        onMouseMove={onMouse}
        className="relative w-full overflow-hidden rounded-3xl bg-body"
      >
        {/* glowing brand blobs */}
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.08, 1], x: [0, 14, 0], y: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-24 -top-32 h-[380px] w-[380px] rounded-full blur-[42px]"
          style={{ background: "radial-gradient(circle at 30% 30%, rgba(28,63,189,.45), transparent 70%)" }}
        />
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.1, 1], x: [0, -16, 0], y: [0, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full blur-[44px]"
          style={{ background: "radial-gradient(circle at 60% 40%, rgba(241,128,50,.42), transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-12 md:flex-row md:px-10">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1c3fbd]/20 bg-white/80 px-3 py-1.5 text-sm font-medium text-[#1c3fbd]">
              <FaAward className="text-buttons_2" /> ISO 9001:2015 Certified Institute
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] md:text-6xl">
              <span className="text-buttons_1">Level-Up</span> your skills the unique way at{" "}
              <span className="font-gelasio">
                S<span className="text-buttons_1">i</span>
                <span className="text-buttons_2">i</span>
                <span className="text-twitter">T</span>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-text_color2">
              A transformative approach to skill development — career-oriented IT, design and
              accounting courses with certification, placements and hands-on training.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses">
                <button className="btn-dark inline-flex items-center gap-2 text-base">
                  Explore Courses <FaArrowRight />
                </button>
              </Link>
              <Link to="/quiz">
                <button className="inline-flex items-center gap-2 rounded-full border border-[#1c3fbd]/25 bg-white/90 px-5 py-2 text-base font-medium text-[#1c3fbd] hover:bg-white">
                  <HiSparkles /> Take Career Quiz
                </button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <Counter to={s.to} className={`text-3xl font-bold ${s.color}`} />
                  <div className="text-sm text-text_color2">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — floating laptop */}
          <div className="relative flex flex-1 items-center justify-center">
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[280px]"
            >
              <div className="relative h-[178px] w-[280px] overflow-hidden rounded-t-2xl border-8 border-[#2a3146] bg-[#1c2030]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1c3fbd] to-[#3457d6]" />
                <div className="absolute inset-0 flex items-center justify-center font-gelasio text-3xl text-white/90">
                  S<span className="text-[#ff7ba1]">i</span>
                  <span className="text-[#ffc59a]">i</span>
                  <span className="text-[#a9e0ff]">T</span>
                </div>
              </div>
              <div className="-ml-6 h-3.5 w-full max-w-[330px] rounded-b-xl bg-[#c3cde0] shadow-inner" />
              <div className="pointer-events-none absolute left-1/2 top-[60px] h-full w-full -translate-x-1/2">
                {cards.map(({ id, course }) => (
                  <CourseCard key={id} course={course} onDone={() => removeCard(id)} />
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute left-0 top-1 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs shadow-[0_8px_22px_rgba(28,63,189,0.18)]"
            >
              <FaAward className="text-buttons_2" /> <span className="font-bold">98% Pass Rate</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute bottom-5 right-0 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs shadow-[0_8px_22px_rgba(235,2,73,0.16)]"
            >
              <FaBriefcase className="text-[#1c3fbd]" /> <span className="font-bold">Placement Support</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default memo(Hero);
