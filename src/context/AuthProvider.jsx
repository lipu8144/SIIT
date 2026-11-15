/**
 * SIIT — AuthProvider (Supabase Auth + dummy fallback)
 * ────────────────────────────────────────────────────
 * Wraps the app. Exposes: user, role, loading, signIn, signOut, changePassword. Logins are created by the admin; there is no public signup.
 * When Supabase is configured, uses real auth with JWT + RLS.
 * Otherwise, falls back to dummy mode with seed users.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { storeInSession, lookInSession, logOutUser } from "../common/session";
import { findDemoUser } from "../services/db";
import { loginToEmail } from "../lib/loginId";

const AuthContext = createContext(null);
const SESSION_KEY = "user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Bootstrap: restore session ─────────────────────── */
  useEffect(() => {
    if (isSupabaseConfigured) {
      // Get existing session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        }
        setLoading(false);
      });

      // Listen for auth changes (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const profile = await fetchProfile(session.user.id);
            setUser(profile);
            storeInSession(SESSION_KEY, JSON.stringify(profile));
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            logOutUser();
          }
        }
      );
      return () => subscription.unsubscribe();
    } else {
      // Dummy mode: restore from sessionStorage
      const stored = lookInSession(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    }
  }, []);

  /* ── Fetch profile from users table ─────────────────── */
  const fetchProfile = async (uid) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)
      .single();

    if (error) {
      // A real error (RLS, network) — surface it so misconfig is visible,
      // instead of silently treating an admin as a student.
      console.error("Could not load user profile:", error.message);
    }

    if (!data) {
      // Profile row genuinely missing (e.g. trigger didn't run). Fall back
      // to student so the app still works, but log it clearly.
      if (!error) console.warn("No profile row for user; defaulting to student.");
      return { id: uid, role: "student", access_token: "supabase" };
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      access_token: "supabase",
    };
  };

  /* ── Sign In ────────────────────────────────────────── */
  const signIn = useCallback(async (identifier, password) => {
    if (isSupabaseConfigured) {
      // Students type a User ID; it is converted to the hidden email Supabase needs.
      // Staff can still type a real email.
      const email = loginToEmail(identifier);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (/invalid login credentials/i.test(error.message)) {
          throw new Error("Wrong User ID or password. Please try again, or ask the institute office to reset it.");
        }
        throw error;
      }
      const profile = await fetchProfile(data.user.id);
      setUser(profile);
      storeInSession(SESSION_KEY, JSON.stringify(profile));
      return profile;
    }
    // Demo mode
    const found = findDemoUser(identifier, password);
    if (!found) throw new Error("Wrong User ID or password");
    const safe = { id: found.id, email: found.email, name: found.name, role: found.role, access_token: found.id };
    storeInSession(SESSION_KEY, JSON.stringify(safe));
    setUser(safe);
    return safe;
  }, []);

  /* ── Sign Out ───────────────────────────────────────── */
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    logOutUser();
    setUser(null);
  }, []);

  /* ── Change password ────────────────────────────────── */
  const changePassword = useCallback(async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    }
    // Dummy mode: nothing to persist, but succeed so the UI flow works
    await new Promise((r) => setTimeout(r, 400));
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, loading, signIn, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

/* ── Route guard ──────────────────────────────────────── */
export const RequireRole = ({ allow, roles, children }) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  // Accept either `allow` (used in routes) or `roles` — whichever is provided
  const permitted = allow || roles || [];

  useEffect(() => {
    // Only decide once auth has finished resolving — never redirect while loading
    if (loading) return;
    if (!user || !permitted.includes(role)) {
      navigate("/signin", { replace: true });
    }
  }, [user, role, loading, permitted, navigate]);

  // While auth is resolving, show nothing (prevents a flash + premature redirect)
  if (loading) return null;
  // Authorised → render; otherwise render nothing while the effect redirects
  if (user && permitted.includes(role)) return children;
  return null;
};
