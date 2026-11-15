import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaRedo, FaBriefcase, FaRupeeSign, FaClock } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import toast from "react-hot-toast";

import { quizService } from "../services/growthDb";

/**
 * SIIT — Career Assessment Quiz (Phase 5)
 * 5-question multi-step quiz → local recommendation engine →
 * result cards showing course + career paths + salary range.
 * Submission saved via quizService (dummy / Supabase).
 * Route: <Route path="/quiz" element={<Quiz />} />
 */

const QUESTIONS = [
  {
    key: "interest",
    question: "What best describes your interest?",
    options: [
      { label: "Working with numbers & finance",   icon: "🧾" },
      { label: "Creating designs & visuals",        icon: "🎨" },
      { label: "Writing code & building apps",      icon: "💻" },
      { label: "Using computers for office work",   icon: "📋" },
    ],
  },
  {
    key: "education",
    question: "What is your current education level?",
    options: [
      { label: "Below 10th",                icon: "📚" },
      { label: "10th / 12th",               icon: "🎓" },
      { label: "Graduate / Pursuing degree", icon: "🏛️" },
      { label: "Working professional",       icon: "💼" },
    ],
  },
  {
    key: "goal",
    question: "What is your primary career goal?",
    options: [
      { label: "Government job / Office role",    icon: "🏛️" },
      { label: "Private company placement",       icon: "🏢" },
      { label: "Freelancing / Self-employment",   icon: "🚀" },
      { label: "Support higher education",        icon: "📖" },
    ],
  },
  {
    key: "time",
    question: "How much time can you commit daily?",
    options: [
      { label: "Less than 1 hour",  icon: "⏱️" },
      { label: "1–2 hours",         icon: "⌚" },
      { label: "3–4 hours",         icon: "🕐" },
      { label: "Full-time",         icon: "📅" },
    ],
  },
  {
    key: "style",
    question: "How do you prefer to learn?",
    options: [
      { label: "Hands-on practice & projects", icon: "🛠️" },
      { label: "Theory-first then practical",  icon: "📝" },
      { label: "Visual demos & videos",        icon: "🎬" },
      { label: "One-on-one mentoring",         icon: "🤝" },
    ],
  },
];

const COURSE_DETAILS = {
  "Tally with GST":  { careers: ["Accountant","GST Consultant","Finance Executive"],    salary: "₹12,000 – ₹25,000/mo", duration: "3 months"  },
  "Advanced Excel":  { careers: ["Data Analyst","MIS Executive","Finance Analyst"],     salary: "₹15,000 – ₹30,000/mo", duration: "2 months"  },
  "Photoshop":       { careers: ["Graphic Designer","Photo Editor","Content Creator"],  salary: "₹12,000 – ₹28,000/mo", duration: "3 months"  },
  "Blender":         { careers: ["3D Artist","Motion Designer","Game Asset Creator"],   salary: "₹18,000 – ₹45,000/mo", duration: "3 months"  },
  "JAVA":            { careers: ["Java Developer","Backend Engineer","App Developer"],  salary: "₹20,000 – ₹50,000/mo", duration: "4 months"  },
  "C++":             { careers: ["Software Engineer","Systems Programmer","DSA Coach"], salary: "₹18,000 – ₹40,000/mo", duration: "2 months"  },
  "OS-CIT":          { careers: ["Computer Operator","Office Assistant","DEO"],         salary: "₹8,000 – ₹18,000/mo",  duration: "3 months"  },
  "MS-Office":       { careers: ["Office Executive","Admin Assistant","MIS Officer"],   salary: "₹8,000 – ₹16,000/mo",  duration: "2 months"  },
  "Web Development": { careers: ["Frontend Developer","Full-Stack Dev","Freelancer"],   salary: "₹18,000 – ₹50,000/mo", duration: "4 months"  },
  "Graphic Design":  { careers: ["Brand Designer","UI Designer","Print Designer"],      salary: "₹12,000 – ₹30,000/mo", duration: "3 months"  },
  "C":               { careers: ["Systems Programmer","Embedded Dev","CS Fundamentals"],salary: "₹12,000 – ₹25,000/mo", duration: "2 months"  },
  "MS-Excel":        { careers: ["Office Executive","Data Entry","Billing Clerk"],       salary: "₹8,000 – ₹15,000/mo",  duration: "1.5 months"},
};

const TINTS = ["#1c3fbd","#eb0249","#f18032","#1DA1F2","#8B46FF"];
const tintOf = (c) => TINTS[c.length % TINTS.length];

const Quiz = () => {
  const [step, setStep]       = useState(0);           // 0-4 questions, 5 = result
  const [answers, setAnswers] = useState({});
  const [result, setResult]   = useState(null);
  const [saving, setSaving]   = useState(false);

  const pick = async (key, value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Final question answered — compute result
      setSaving(true);
      try {
        const res = await quizService.submit(next);
        setResult(res.recommended_courses);
      } catch {
        toast.error("Could not save submission — showing results anyway");
        // Still show result locally
        const { recommend: rec } = await import("../services/growthDb").then((m) => ({
          recommend: (a) => ["OS-CIT","Tally with GST","Advanced Excel"],
        }));
        setResult(rec(next));
      } finally {
        setSaving(false);
        setStep(QUESTIONS.length);
      }
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); };
  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-body px-4 py-16">
      {/* blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[50px]"
        style={{ background: "radial-gradient(circle,rgba(28,63,189,.32),transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full blur-[44px]"
        style={{ background: "radial-gradient(circle,rgba(235,2,73,.28),transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* header */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#1c3fbd]">
            <HiSparkles className="text-buttons_2" /> AI Career Assessment
          </div>
          <h1 className="mt-2 text-3xl font-medium">
            Find your <span className="text-buttons_1">perfect course</span>
          </h1>
          <p className="mt-1 text-sm text-text_color2">Answer 5 quick questions — we'll match you to the right program.</p>
        </div>

        {/* progress bar */}
        {step < QUESTIONS.length && (
          <div className="mb-6">
            <div className="mb-1.5 flex justify-between text-xs text-dark-grey">
              <span>Question {step + 1} of {QUESTIONS.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white">
              <motion.div
                className="h-full rounded-full bg-buttons_1"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        {/* card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(28,63,189,0.12)]">
          <AnimatePresence mode="wait">
            {step < QUESTIONS.length ? (
              <motion.div key={`q-${step}`}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="p-7"
              >
                <h2 className="mb-6 text-xl font-medium">{QUESTIONS[step].question}</h2>
                <div className="flex flex-col gap-3">
                  {QUESTIONS[step].options.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => pick(QUESTIONS[step].key, i)}
                      className="flex items-center gap-3 rounded-xl border border-[#1c3fbd]/15 bg-body px-4 py-3 text-left text-sm font-medium transition hover:border-[#1c3fbd]/40 hover:bg-[#1c3fbd]/5"
                    >
                      <span className="text-xl">{opt.icon}</span>
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : saving ? (
              <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#1c3fbd]/20 border-t-[#1c3fbd]" />
                <p className="text-text_color2">Analysing your answers…</p>
              </motion.div>
            ) : (
              <motion.div key="result"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-7"
              >
                <div className="mb-6 text-center">
                  <span className="text-5xl">🎯</span>
                  <h2 className="mt-3 text-2xl font-medium">Your recommended courses</h2>
                  <p className="mt-1 text-sm text-text_color2">Based on your interests, education, goals and time.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {(result || []).map((course, i) => {
                    const tint    = tintOf(course);
                    const details = COURSE_DETAILS[course] || {};
                    return (
                      <motion.div key={course}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className="rounded-2xl border-2 p-4"
                        style={{ borderColor: `${tint}30`, background: `${tint}08` }}
                      >
                        {i === 0 && (
                          <span className="mb-2 inline-block rounded-full bg-buttons_1/10 px-2.5 py-0.5 text-xs font-medium text-buttons_1">
                            ⭐ Best Match
                          </span>
                        )}
                        <h3 className="text-lg font-bold" style={{ color: tint }}>{course}</h3>
                        {details.careers && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {details.careers.map((c) => (
                              <span key={c} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-dark-grey">
                                <FaBriefcase className="mr-1 inline" size={10} />{c}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex gap-4 text-xs text-text_color2">
                          {details.salary   && <span><FaRupeeSign className="mr-0.5 inline" size={10} />{details.salary}</span>}
                          {details.duration && <span><FaClock className="mr-0.5 inline" size={10} />{details.duration}</span>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Link to="/courses" className="btn-dark block w-full text-center text-base">
                    Explore These Courses <FaArrowRight className="ml-1 inline" />
                  </Link>
                  <button onClick={reset}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1c3fbd]/20 py-2.5 text-sm font-medium text-[#1c3fbd] hover:bg-[#1c3fbd]/5"
                  >
                    <FaRedo size={12} /> Retake Quiz
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Quiz;
