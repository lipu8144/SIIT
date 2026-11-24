import { useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";

import Reveal from "../common/Reveal";
import Loader from "../components/Loader";
import { eventService } from "../services/db";
import { UserContext } from "../App";

/**
 * SIIT — Events page (Phase 2, DB-backed)
 * Upcoming / Past tabs, live countdown to the next event, registration CTA.
 * Data via eventService (dummy now, Supabase later). Add route:
 *   <Route path="/events" element={<Events />} />
 */

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
    done: diff === 0,
  };
}

const CountUnit = ({ value, label }) => (
  <div className="min-w-[54px] rounded-xl bg-white/20 px-3 py-2 text-center">
    <div className="text-2xl font-medium">{String(value).padStart(2, "0")}</div>
    <div className="text-[10px] opacity-85">{label}</div>
  </div>
);

const EventCard = ({ ev, past }) => {
  // must be read HERE: this card is its own component, so it cannot see the one in Events
  const { setShowPopup } = useContext(UserContext);
  return (
  <Reveal className={`rounded-2xl bg-white p-4 ${past ? "opacity-80" : ""}`}>
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        ev.registration_open ? "bg-buttons_2/10 text-buttons_2" : "bg-[#1c3fbd]/10 text-[#1c3fbd]"
      }`}
    >
      {ev.registration_open ? "Registration open" : past ? "Past event" : "Coming soon"}
    </span>
    <h4 className="my-2 font-bold leading-snug">{ev.title}</h4>
    <p className="mb-3 text-sm text-text_color2 line-clamp-2">{ev.description}</p>
    <div className="mb-1 flex items-center gap-2 text-xs text-dark-grey">
      <FaCalendarAlt /> {fmtDate(ev.starts_at)}
    </div>
    <div className="mb-3 flex items-center gap-2 text-xs text-dark-grey">
      <FaMapMarkerAlt /> {ev.location}
      {ev.capacity ? (
        <span className="ml-2 flex items-center gap-1">
          <FaUsers /> {ev.capacity} seats
        </span>
      ) : null}
    </div>
    {!past && ev.registration_open && <button onClick={() => setShowPopup(true)} className="btn-dark w-full text-sm">Register</button>}
  </Reveal>
  );
};

export const Events = () => {
  useEffect(() => {
    document.title = "SIIT | Events";
  }, []);

  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState(null);
  const [past, setPast] = useState([]);

  useEffect(() => {
    (async () => {
      const [u, p] = await Promise.all([eventService.upcoming(), eventService.past()]);
      setUpcoming(u);
      setPast(p);
    })();
  }, []);

  const next = useMemo(() => upcoming?.[0] || null, [upcoming]);
  const cd = useCountdown(next?.starts_at || Date.now());

  if (!upcoming) return <Loader />;

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <section className="py-10">
      <Reveal>
        <h1 className="text-center text-4xl font-medium md:text-5xl">
          SIIT <span className="text-buttons_1">Events</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-text_color2">
          Workshops, orientations and celebrations at our campus.
        </p>
      </Reveal>

      {/* countdown to next event */}
      {next && (
        <Reveal className="mx-auto mt-8 max-w-3xl rounded-2xl bg-gradient-to-br from-[#1c3fbd] to-[#3457d6] p-6 text-white">
          <div className="text-xs tracking-wide opacity-85">NEXT EVENT</div>
          <h3 className="mb-1 mt-1 text-xl font-medium">{next.title}</h3>
          <div className="mb-4 text-sm opacity-90">
            <FaMapMarkerAlt className="mr-1 inline" /> {next.location} · {fmtDate(next.starts_at)}
          </div>
          <div className="flex gap-2.5">
            <CountUnit value={cd.days} label="DAYS" />
            <CountUnit value={cd.hours} label="HRS" />
            <CountUnit value={cd.mins} label="MIN" />
            <CountUnit value={cd.secs} label="SEC" />
          </div>
        </Reveal>
      )}

      {/* tabs */}
      <div className="mt-8 flex justify-center gap-2">
        {["upcoming", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-5 py-1.5 text-sm font-medium capitalize transition-all ${
              tab === t
                ? "border-[#1c3fbd] bg-[#1c3fbd] text-white"
                : "border-[#1c3fbd]/20 bg-white text-[#1c3fbd] hover:bg-[#1c3fbd]/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* grid */}
      <motion.div layout className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((ev) => (
            <motion.div layout key={ev.id} exit={{ opacity: 0, scale: 0.95 }}>
              <EventCard ev={ev} past={tab === "past"} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && (
        <p className="mt-10 text-center text-text_color2">No {tab} events right now.</p>
      )}
    </section>
  );
};

export default Events;
