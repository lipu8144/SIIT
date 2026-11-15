// ════════════════════════════════════════════════════════════
// SIIT — Edge Function: admin-users
// ────────────────────────────────────────────────────────────
// Lets an ADMIN / SUPER ADMIN create logins for students & staff,
// reset their passwords, and delete them. Students never sign up
// themselves and never need an email.
//
// WHY A SERVER FUNCTION?  Creating a login needs Supabase's secret
// "service_role" key. That key must NEVER be in the browser, so the
// browser calls this function instead; the function checks the caller
// is really an admin, then does the privileged work.
//
// Actions (POST JSON body):
//   { action: "ping" }
//   { action: "create",         username, name, password, role, phone?, student_id? }
//   { action: "reset_password", id, password }
//   { action: "delete",         id }
//
// Deploy:  see STUDENT_LOGIN_SETUP.md
// ════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

/* A User ID such as "siit-2024-001" is turned into a hidden email so
   Supabase Auth (which needs an email) can store it. Gmail ignores
   everything after "+", so this address is always valid for Supabase.
   No email is ever sent. KEEP THIS IDENTICAL to src/lib/loginId.js */
const LOGIN_EMAIL_BASE = (Deno.env.get("LOGIN_EMAIL_BASE") ?? "siitsurada@gmail.com").toLowerCase();
const idToEmail = (id: string) => {
  const [local, domain] = LOGIN_EMAIL_BASE.split("@");
  return `${local}+${id}@${domain}`;
};

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
const MIN_PASSWORD = 6;

// who may create which role
const creatableBy = (callerRole: string): string[] =>
  callerRole === "super_admin" ? ["student", "teacher", "admin"] : ["student", "teacher"];

const isAdminRole = (r?: string) => r === "admin" || r === "super_admin";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Function is not configured" }, 500);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /* ── 1. Who is calling? ─────────────────────────────── */
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Please sign in first" }, 401);

  const { data: authData, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !authData?.user) {
    return json({ error: "Your session has expired. Please sign in again." }, 401);
  }
  const callerId = authData.user.id;

  const { data: callerRow } = await admin
    .from("users").select("role").eq("id", callerId).maybeSingle();
  const callerRole = callerRow?.role as string | undefined;

  if (!isAdminRole(callerRole)) return json({ error: "Only admins can do this" }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }

  /* ── 2. Do the action ───────────────────────────────── */
  switch (body.action) {
    case "ping":
      return json({ ok: true, role: callerRole });

    /* ---------- create ---------- */
    case "create": {
      const username = String(body.username ?? "").trim().toLowerCase();
      const name = String(body.name ?? "").trim();
      const password = String(body.password ?? "");
      const role = String(body.role ?? "student");
      const phone = body.phone ? String(body.phone).trim() : null;
      const studentId = body.student_id ? String(body.student_id) : null;

      if (!name) return json({ error: "Name is required" }, 400);
      if (!USERNAME_RE.test(username)) {
        return json({
          error: "User ID must be 3-32 characters: small letters, numbers, dot, dash or underscore (no spaces).",
        }, 400);
      }
      if (password.length < MIN_PASSWORD) {
        return json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, 400);
      }
      if (!creatableBy(callerRole!).includes(role)) {
        return json({ error: "You are not allowed to create this type of account" }, 403);
      }

      const { data: taken } = await admin
        .from("users").select("id").eq("username", username).maybeSingle();
      if (taken) return json({ error: "This User ID is already taken" }, 409);

      const email = idToEmail(username);
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,            // no confirmation email needed
        user_metadata: { name },
      });
      if (createErr || !created?.user) {
        const msg = createErr?.message ?? "Could not create login";
        const dup = /already|registered|exists/i.test(msg);
        return json({ error: dup ? "This User ID is already taken" : msg }, dup ? 409 : 400);
      }
      const uid = created.user.id;

      // The signup trigger already made a `users` row (role=student).
      // Fill in the real details.
      const { error: profileErr } = await admin
        .from("users")
        .upsert({ id: uid, email, name, phone, role, username }, { onConflict: "id" });
      if (profileErr) {
        await admin.auth.admin.deleteUser(uid);   // roll back — no half-made login
        return json({ error: `Could not save profile: ${profileErr.message}` }, 500);
      }

      // Optionally attach this login to an existing student record
      let linked = false;
      if (studentId && role === "student") {
        const { data: st, error: linkErr } = await admin
          .from("students")
          .update({ user_id: uid })
          .eq("id", studentId)
          .is("user_id", null)
          .select("id");
        linked = !linkErr && (st?.length ?? 0) > 0;
      }

      return json({ ok: true, id: uid, username, email, name, role, phone, linked });
    }

    /* ---------- reset password ---------- */
    case "reset_password": {
      const id = String(body.id ?? "");
      const password = String(body.password ?? "");
      if (!id) return json({ error: "Missing user" }, 400);
      if (password.length < MIN_PASSWORD) {
        return json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, 400);
      }

      const { data: target } = await admin
        .from("users").select("id, role").eq("id", id).maybeSingle();
      if (!target) return json({ error: "User not found" }, 404);
      if (isAdminRole(target.role) && callerRole !== "super_admin" && id !== callerId) {
        return json({ error: "Only a super admin can reset an admin's password" }, 403);
      }

      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    /* ---------- delete ---------- */
    case "delete": {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "Missing user" }, 400);
      if (id === callerId) return json({ error: "You cannot delete your own account" }, 400);

      const { data: target } = await admin
        .from("users").select("id, role").eq("id", id).maybeSingle();
      if (!target) return json({ error: "User not found" }, 404);
      if (isAdminRole(target.role) && callerRole !== "super_admin") {
        return json({ error: "Only a super admin can delete an admin" }, 403);
      }
      if (target.role === "super_admin") {
        const { count } = await admin
          .from("users").select("id", { count: "exact", head: true }).eq("role", "super_admin");
        if ((count ?? 0) <= 1) return json({ error: "You cannot delete the last super admin" }, 400);
      }

      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return json({ error: error.message }, 400);
      await admin.from("users").delete().eq("id", id);   // safety net (normally cascades)
      return json({ ok: true });
    }

    default:
      return json({ error: "Unknown action" }, 400);
  }
});
