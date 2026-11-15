import { useContext, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaPhoneAlt } from "react-icons/fa";
import toast from "react-hot-toast";

import { UserContext } from "../App";
import { useAuth } from "../context/AuthProvider";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { storeInSession } from "../common/session";

/**
 * SIIT — Login (the ONLY login page)
 * Students, teachers and admins all sign in here with a User ID + password.
 * There is no public sign-up: the super admin creates every login from
 * Admin → Users, so nobody needs an email address or a confirmation mail.
 * Staff may also type a real email instead of a User ID.
 */

const FIELD =
  "w-full rounded-lg border border-[#1c3fbd]/20 bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#1c3fbd] focus:ring-2 focus:ring-[#1c3fbd]/20";

const destFor = (role) => {
  if (["admin", "super_admin"].includes(role)) return "/admin";
  if (["student", "teacher"].includes(role)) return "/portal";
  return "/";
};

const UserAuthForm = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const { signIn } = useAuth();
  const SITE = useSiteConfig();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const idRef = useRef();
  const passwordRef = useRef();

  // Already signed in → go to the right dashboard (not just the home page)
  if (userAuth?.access_token) return <Navigate to={destFor(userAuth.role)} replace />;

  const persistSession = (user) => {
    // Keeps the Navbar avatar working
    const session = {
      access_token: user.id || "token",
      profile_img: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=1c3fbd&color=fff`,
      name: user.name || "User",
      role: user.role || "student",
    };
    storeInSession("user", JSON.stringify(session));
    setUserAuth(session);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifier = idRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    if (!identifier) { toast.error("Enter your User ID"); idRef.current?.focus(); return; }
    if (!password) { toast.error("Enter your password"); passwordRef.current?.focus(); return; }

    setLoading(true);
    try {
      const user = await signIn(identifier, password);
      persistSession(user);
      toast.success(`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}!`);
      navigate(destFor(user.role), { replace: true });
    } catch (err) {
      toast.error(err?.message || "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-body py-16">
      
      {/* brand blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[44px]"
        style={{ background: "radial-gradient(circle,rgba(28,63,189,.38),transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full blur-[40px]"
        style={{ background: "radial-gradient(circle,rgba(241,128,50,.35),transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* logo */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-block font-gelasio text-5xl font-bold text-[#1c3fbd]">
            S<span className="text-buttons_1">i</span>
            <span className="text-buttons_2">i</span>
            <span className="text-twitter">T</span>
          </Link>
          <h1 className="mt-1 text-2xl font-medium">Welcome back</h1>
          <p className="text-sm text-text_color2">Sign in with the User ID given by SIIT</p>
        </div>

        {/* card */}
        <div className="rounded-2xl bg-white p-7 shadow-[0_12px_40px_rgba(28,63,189,0.12)]">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium">User ID</label>
              <input
                ref={idRef}
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="e.g. siit-2024-001"
                className={FIELD}
              />
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${FIELD} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-grey hover:text-black"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-dark w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? "Please wait…" : "Sign In"}
            </button>
          </form>

          {/* help — replaces sign-up and forgot-password */}
          <div className="mt-5 rounded-xl bg-body p-3 text-center text-sm text-text_color2">
            <p className="font-medium text-text_color1">Forgot your password or don&apos;t have a login?</p>
            <p className="mt-0.5">
              Please ask the SIIT office. They will give you a User ID or reset your password.
            </p>
            {SITE.phone && (
              <a href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}
                className="mt-2 inline-flex items-center gap-2 font-medium text-[#1c3fbd] hover:underline">
                <FaPhoneAlt size={12} /> {SITE.phone}
              </a>
            )}
          </div>
        </div>

        {/* demo logins hint — only shown in demo mode (no Supabase configured) */}
        {!isSupabaseConfigured && (
          <div className="mt-4 rounded-xl border border-[#1c3fbd]/15 bg-white/70 p-3 text-xs text-text_color2">
            <span className="font-medium">Demo logins: </span>
            admin / admin123 · student / stud123
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default UserAuthForm;
