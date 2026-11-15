/**
 * SIIT — login ID helpers
 * ───────────────────────
 * Students sign in with a User ID (e.g. "siit-2024-001"), not an email.
 * Supabase Auth needs an email internally, so the ID is converted to a
 * hidden one. Gmail ignores everything after "+", so the address is
 * always valid; no email is ever sent to it.
 *
 * KEEP IDENTICAL to idToEmail in supabase/functions/admin-users/index.ts
 * (both use the same base address).
 *
 * Staff may also sign in with a real email — anything containing "@"
 * is used as typed.
 */

const BASE = (import.meta.env.VITE_LOGIN_EMAIL_BASE || "siitsurada@gmail.com").toLowerCase();

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;

/** "siit-2024-001" -> "siitsurada+siit-2024-001@gmail.com" ; real emails pass through */
export const loginToEmail = (identifier = "") => {
  const v = identifier.trim().toLowerCase();
  if (!v) return "";
  if (v.includes("@")) return v;
  const [local, domain] = BASE.split("@");
  return `${local}+${v}@${domain}`;
};

/** Turn a name / enrollment number into a valid suggested User ID */
export const suggestUsername = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

/** Easy-to-read random password (no look-alike characters) */
export const generatePassword = (length = 8) => {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};
