import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";
import Reveal from "../common/Reveal";

const FAQS = [
  {
    q: "Do I need any prior computer knowledge to join?",
    a: "No. Our foundation courses like DCA and OS-CIT start from the absolute basics — switching on a computer, using the mouse, and typing.",
  },
  {
    q: "Are the certificates recognised?",
    a: "Yes. OS-CIT is a government-recognised certification, and our diplomas are widely accepted by local employers and for further study.",
  },
  {
    q: "What are the class timings?",
    a: "We run multiple batches through the day and evening so working professionals and students can both attend. Pick a slot at enrolment.",
  },
  {
    q: "Do you help with jobs after the course?",
    a: "We offer resume building, interview preparation, and connect students with local hiring partners for data-entry, accounting, and IT roles.",
  },
  {
    q: "Can I pay the fees in instalments?",
    a: "Most of our longer courses support monthly instalments. Talk to the front desk or use the contact form to arrange a plan.",
  },
];

export const Faq = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="section container-x">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-buttons_1">
          FAQ
        </p>
        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Questions, answered
        </h2>
      </Reveal>

      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal
              key={f.q}
              index={i}
              className="overflow-hidden rounded-xl border border-black/5 bg-white"
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-[#1b2447]">{f.q}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-buttons_1/10 text-buttons_1">
                  {isOpen ? <FaMinus size={11} /> : <FaPlus size={11} />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-5 text-sm text-text_color2/80">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default Faq;
