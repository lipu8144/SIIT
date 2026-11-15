import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

import SiitLogo from "./SiitLogo";
import { useSiteConfig, buildWhatsappLink } from "../hooks/useSiteConfig";

const Footer = () => {
  const SITE = useSiteConfig();
  const year = new Date().getFullYear();

  const col = (title, links) => (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-white/70 transition hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="mt-20 bg-overlay text-white">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <SiitLogo size="sm" />
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Smart Institute of Information Technology — practical computer & IT
            training, government-certified courses, and career support.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: FaFacebookF, href: SITE.social.facebook },
              { Icon: FaInstagram, href: SITE.social.instagram },
              { Icon: FaYoutube, href: SITE.social.youtube },
              { Icon: FaWhatsapp, href: buildWhatsappLink(SITE.whatsapp) },
            ]
              .filter(({ href }) => href)
              .map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-buttons_1"
                  aria-label="Social link"
                >
                  <Icon size={15} />
                </a>
              ))}
          </div>
        </div>

        {col("Explore", [
          { to: "/courses", label: "Courses" },
          { to: "/about", label: "About us" },
          { to: "/blog", label: "Blog" },
          { to: "/events", label: "Events" },
          { to: "/gallery", label: "Gallery" },
        ])}

        {col("For students", [
          { to: "/quiz", label: "Career quiz" },
          { to: "/portal", label: "Student portal" },
          { to: "/signin", label: "Login" },
          { to: "/contact", label: "Contact" },
        ])}

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
            Reach us
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-0.5 shrink-0 text-buttons_2" />
              {SITE.address}
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="shrink-0 text-buttons_2" />
              {SITE.phone}
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="shrink-0 text-buttons_2" />
              {SITE.email}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {year} SIIT — Smart Institute of Information Technology.</p>
          <p>Built with React · Vite · Tailwind</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
