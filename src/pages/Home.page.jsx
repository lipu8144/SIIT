import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

import AnimationWrapper from "../common/page-animation";
import Hero         from "../components/Hero.component";
import { ChooseUs }   from "../components/ChooseUS";
import { Categories } from "../components/Categories.components";
import Courses        from "../components/Courses.component";
import { Faq }        from "../components/Faq.components";
import Testimonial    from "../components/Testimonial.component";
import { Newsletter } from "../components/Newsletter.component";
import Reveal         from "../common/Reveal";

import { eventService } from "../services/db";

/**
 * SIIT — Home page (Phase 5 update)
 * Preserves all existing sections. Adds:
 *   1. Upcoming events widget (between Faq and Testimonial)
 *   2. AI career quiz CTA section (between Testimonial and Newsletter)
 */

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const UpcomingEventsWidget = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventService.upcoming().then((all) => setEvents(all.slice(0, 3)));
  }, []);

  if (!events.length) return null;

  return (
    <section className="my-16">
      <Reveal>
        <h1 className="mb-8 text-center text-4xl font-bold md:text-5xl">
          Upcoming <span className="text-buttons_1">Events</span>
        </h1>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {events.map((ev, i) => (
          <Reveal key={ev.id} index={i}
            className="overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-lg"
          >
            <div className="h-2 w-full bg-gradient-to-r from-[#1c3fbd] to-buttons_1" />
            <div className="p-5">
              <h3 className="mb-2 font-bold leading-snug">{ev.title}</h3>
              <p className="mb-3 text-sm text-text_color2 line-clamp-2">{ev.description}</p>
              <div className="mb-1 flex items-center gap-2 text-xs text-dark-grey">
                <FaCalendarAlt /> {fmtDate(ev.starts_at)}
              </div>
              <div className="mb-4 flex items-center gap-2 text-xs text-dark-grey">
                <FaMapMarkerAlt /> {ev.location}
              </div>
              {ev.registration_open && (
                <Link to="/events">
                  <button className="btn-dark w-full text-sm">Register Free</button>
                </Link>
              )}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-6 text-center">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-[#1c3fbd] hover:underline">
          View all events <FaArrowRight size={12} />
        </Link>
      </Reveal>
    </section>
  );
};

const QuizCTA = () => (
  <Reveal className="my-16">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c3fbd] to-[#3457d6] px-8 py-14 text-center text-white">
      {/* decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/8"  />

      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4 inline-block text-5xl"
      >
        🎯
      </motion.div>
      <h2 className="mb-3 text-3xl font-bold md:text-4xl">
        Not sure which course to pick?
      </h2>
      <p className="mx-auto mb-8 max-w-lg text-lg opacity-90">
        Answer 5 quick questions and our AI will recommend the perfect course for your goals, background and schedule.
      </p>
      <Link to="/quiz">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-full bg-buttons_1 px-8 py-3.5 text-base font-medium text-white shadow-lg hover:bg-opacity-90"
        >
          <HiSparkles /> Take the Free Quiz
        </motion.button>
      </Link>
      <div className="mt-4 text-sm opacity-70">Takes less than 2 minutes · No sign-up required</div>
    </div>
  </Reveal>
);

const Home = () => {
  useEffect(() => {
    document.title = "SIIT - Smart Institute of Information Technology";
  }, []);

  return (
    <AnimationWrapper>
      <main className="w-full">
        <Hero />
        <ChooseUs />
        <Categories />
        <Courses />
        <Faq />

        {/* Phase 5 additions */}
        <UpcomingEventsWidget />
        <QuizCTA />

        <Testimonial />
        <Newsletter />
      </main>
    </AnimationWrapper>
  );
};

export default memo(Home);
