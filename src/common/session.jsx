/**
 * SIIT — sessionStorage helpers
 * --------------------------------------------------------------
 * Thin wrappers around the browser sessionStorage API used by the
 * auth flow (UserContext + AuthProvider). Safe on the server / before
 * hydration because every call guards for `window`.
 *
 * Exports:
 *   storeInSession(key, value)   — persist a string value
 *   lookInSession(key)           — read a value (or null)
 *   removeFromSession(key)       — delete one key
 *   logOutUser()                 — clear the whole session store
 */

const hasWindow = typeof window !== "undefined";

export const storeInSession = (key, value) => {
  if (hasWindow) sessionStorage.setItem(key, value);
};

export const lookInSession = (key) => {
  if (hasWindow) return sessionStorage.getItem(key);
  return null;
};

export const removeFromSession = (key) => {
  if (hasWindow) sessionStorage.removeItem(key);
};

export const logOutUser = () => {
  if (hasWindow) sessionStorage.clear();
};
