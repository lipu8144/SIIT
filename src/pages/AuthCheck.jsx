import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { userAdminService } from "../services/db";

/**
 * SIIT — Setup check  (visit /auth-check)
 * Tells you exactly which part of the Supabase setup is missing, so you
 * don't have to guess. Safe to leave in; remove before handover if you like.
 */

const Row = ({ label, status, detail }) => {
  const color = status === "pass" ? "#16a34a" : status === "fail" ? "#eb0249" : status === "warn" ? "#f18032" : "#6b7a90";
  const icon = status === "pass" ? "✓" : status === "fail" ? "✗" : status === "warn" ? "!" : "…";
  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
      <span style={{ color, fontWeight: 700, width: 20 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, color: "#1b2447" }}>{label}</div>
        {detail && <div style={{ fontSize: 13, color: "#42506a", marginTop: 2 }}>{detail}</div>}
      </div>
    </div>
  );
};

export default function AuthCheck() {
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    (async () => {
      const out = [];
      const push = (c) => { out.push(c); setChecks([...out]); };

      if (!isSupabaseConfigured) {
        push({ label: "Supabase keys", status: "fail", detail: "Keys are blank, so the app is in demo mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env / Vercel and redeploy." });
        return;
      }
      push({ label: "Supabase keys", status: "pass", detail: "Keys are set." });

      // users table readable (RLS recursion fixed by 0007)
      const u = await supabase.from("users").select("id").limit(1);
      if (u.error) {
        push({ label: "Users table", status: "fail", detail: /recursion/i.test(u.error.message) ? "Infinite recursion. Run migration 0007." : u.error.message });
      } else {
        push({ label: "Users table", status: "pass", detail: "Readable." });
      }

      // username column (0008)
      const col = await supabase.from("users").select("username").limit(1);
      push(col.error
        ? { label: "User ID column (migration 0008)", status: "fail", detail: "Missing. Run supabase/migrations/0008_admin_created_logins.sql in the SQL editor." }
        : { label: "User ID column (migration 0008)", status: "pass", detail: "Present." });

      // who am I?
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        push({ label: "Admin login service (admin-users function)", status: "warn", detail: "Sign in as the super admin, then reload this page to test it." });
        return;
      }
      const prof = await supabase.from("users").select("role").eq("id", session.user.id).maybeSingle();
      const role = prof.data?.role;
      push({ label: "Signed in", status: role ? "pass" : "warn", detail: role ? `${session.user.email} · role: ${role}` : "Signed in, but no profile row was found in the users table." });

      if (!["admin", "super_admin"].includes(role)) {
        push({ label: "Admin login service (admin-users function)", status: "warn", detail: "Only an admin can test this. Sign in as admin." });
        return;
      }
      try {
        await userAdminService.ping();
        push({ label: "Admin login service (admin-users function)", status: "pass", detail: "Deployed and working. You can create student logins." });
      } catch (e) {
        push({ label: "Admin login service (admin-users function)", status: "fail", detail: e.message });
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1b2447" }}>SIIT — Setup check</h1>
      <p style={{ color: "#42506a", marginTop: 4 }}>Checks the parts needed for admin-created student logins.</p>

      <div style={{ marginTop: 24, background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        {checks.length === 0 ? <p style={{ color: "#6b7a90" }}>Running checks…</p> : checks.map((c, i) => <Row key={i} {...c} />)}
      </div>

      <div style={{ marginTop: 24, fontSize: 13, color: "#42506a", lineHeight: 1.7 }}>
        <strong style={{ color: "#1b2447" }}>If something is red:</strong>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          <li>Keys blank → add them and redeploy.</li>
          <li>Recursion → run migration 0007. User ID column missing → run migration 0008.</li>
          <li>Function error → deploy <code>admin-users</code> (see STUDENT_LOGIN_SETUP.md).</li>
        </ul>
      </div>
    </div>
  );
}
