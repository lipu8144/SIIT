import {
  FaCertificate,
  FaChalkboardTeacher,
  FaLaptopCode,
  FaBriefcase,
} from "react-icons/fa";
import Reveal from "../common/Reveal";

const FEATURES = [
  {
    Icon: FaCertificate,
    title: "Government-certified",
    body: "OS-CIT and recognised diplomas that employers actually accept.",
  },
  {
    Icon: FaChalkboardTeacher,
    title: "Expert mentors",
    body: "Small batches taught by trainers with real industry experience.",
  },
  {
    Icon: FaLaptopCode,
    title: "Hands-on labs",
    body: "Every concept is practised on a computer, not just lectured.",
  },
  {
    Icon: FaBriefcase,
    title: "Placement support",
    body: "Resume help, interview prep, and local job connections.",
  },
];

export const ChooseUs = () => {
  return (
    <section className="section container-x">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-buttons_1">
          Why SIIT
        </p>
        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Built for results, not just attendance
        </h2>
        <p className="mt-3 text-text_color2/80">
          A learning experience designed around practice, mentorship, and the
          careers our students actually want.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal
            key={f.title}
            index={i}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-buttons_1/10 text-buttons_1">
              <f.Icon size={22} />
            </span>
            <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm text-text_color2/80">{f.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default ChooseUs;
