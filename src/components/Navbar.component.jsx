import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

import { UserContext } from "../App";
import UserNavigationPanel from "./UserNavigationPanel";
import SiitLogo from "./SiitLogo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/blog", label: "Blog" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/quiz", label: "Career Quiz" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const { userAuth } = useContext(UserContext);
  const loggedIn = Boolean(userAuth?.access_token);

  const [open, setOpen] = useState(false); // mobile menu
  const [panel, setPanel] = useState(false); // avatar dropdown
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on route change
  useEffect(() => {
    setOpen(false);
    setPanel(false);
  }, [pathname]);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-buttons_1 ${
      isActive ? "text-buttons_1" : "text-text_color2"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition ${
        scrolled
          ? "bg-white/90 shadow-sm backdrop-blur"
          : "bg-white/70 backdrop-blur"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center">
          <SiitLogo size="sm" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.to === "/"} className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <div
              className="relative"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setPanel(false);
              }}
            >
              <button
                onClick={() => setPanel((v) => !v)}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-black/10"
                aria-label="Account menu"
              >
                <img
                  src={
                    userAuth.profile_img ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userAuth.name || "U"
                    )}&background=1c3fdb&color=fff`
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
              {panel && <UserNavigationPanel />}
            </div>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link to="/signin" className="btn-primary px-5 py-2 text-sm">
                Login
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg text-[#1b2447] lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <ul className="container-x flex flex-col py-3">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  className="block py-2.5 text-sm font-medium text-text_color2"
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            {!loggedIn && (
              <li className="mt-2">
                <Link to="/signin" className="btn-primary block w-full py-2 text-center text-sm">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
