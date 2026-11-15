/**
 * SIIT — Firebase Google Auth helper
 * --------------------------------------------------------------
 * Exposes a single `authWithGoogle()` used by the sign-in / sign-up form.
 *
 * The project runs in dummy mode out of the box (no backend needed),
 * so Firebase is NOT a hard dependency. This helper therefore:
 *
 *   • If real Firebase config is present in .env (all VITE_FIREBASE_*
 *     vars set) AND the `firebase` package is installed, it dynamically
 *     imports Firebase and performs a real Google popup sign-in.
 *   • Otherwise it returns a deterministic demo Google user so the UI
 *     flow works end-to-end without any keys or extra packages.
 *
 * TO ENABLE REAL GOOGLE AUTH:
 *   1. npm install firebase
 *   2. Add to .env:
 *        VITE_FIREBASE_API_KEY=...
 *        VITE_FIREBASE_AUTH_DOMAIN=...
 *        VITE_FIREBASE_PROJECT_ID=...
 *        VITE_FIREBASE_APP_ID=...
 *   3. Restart the dev server. No caller changes needed.
 * --------------------------------------------------------------
 */

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId
);

/**
 * Returns a user-like object:
 *   { uid, displayName, email, photoURL, role }
 * or throws if the popup is cancelled / fails.
 */
export const authWithGoogle = async () => {
  if (isFirebaseConfigured) {
    try {
      // Variable specifiers + @vite-ignore so the bundler never tries to
      // resolve Firebase unless it's actually installed and configured.
      const appPkg = "firebase/app";
      const authPkg = "firebase/auth";
      const { initializeApp, getApps } = await import(/* @vite-ignore */ appPkg);
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import(
        /* @vite-ignore */ authPkg
      );
      const app = getApps().length ? getApps()[0] : initializeApp(cfg);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      return {
        uid: u.uid,
        displayName: u.displayName,
        email: u.email,
        photoURL: u.photoURL,
        role: "student",
      };
    } catch (err) {
      // Surface a clean message to the caller's toast
      throw new Error(err?.message || "Google sign-in failed");
    }
  }

  // ── Dummy mode: simulate a successful Google sign-in ──
  await new Promise((r) => setTimeout(r, 500));
  return {
    uid: `g-${Date.now()}`,
    displayName: "Google User",
    email: "google.user@siit.test",
    photoURL:
      "https://ui-avatars.com/api/?name=Google+User&background=1c3fdb&color=fff",
    role: "student",
  };
};
