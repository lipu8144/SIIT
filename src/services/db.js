/**
 * SIIT — Content service layer (Supabase + dummy fallback)
 * ─────────────────────────────────────────────────────────
 * Components import from here — never touch supabase directly.
 * When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set, uses real DB.
 * Otherwise, uses stateful in-memory stores seeded from seed files.
 */
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { loginToEmail, USERNAME_RE } from "../lib/loginId";
import { isLive } from "../lib/liveWindow";
import * as seed from "../data/seed";

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));

/* ─── Generic service factory ─────────────────────────── */
function makeService(table, dummy, { orderBy = null, desc = true } = {}) {
  const _store = clone(dummy);

  return {
    _store,
    async list(filters = {}) {
      if (isSupabaseConfigured) {
        let q = supabase.from(table).select("*");
        if (filters.status && dummy[0] && "status" in dummy[0]) q = q.eq("status", filters.status);
        if (filters.category && filters.category !== "All") q = q.eq("category", filters.category);
        if (orderBy) q = q.order(orderBy, { ascending: !desc });
        const { data, error } = await q;
        if (error) throw error;
        let rows = data || [];
        if (filters.search) rows = rows.filter((r) => r.title?.toLowerCase().includes(filters.search.toLowerCase()));
        return rows;
      }
      await wait();
      let rows = clone(_store);
      if (orderBy) rows.sort((a, b) => desc ? (a[orderBy] < b[orderBy] ? 1 : -1) : (a[orderBy] > b[orderBy] ? 1 : -1));
      if (filters.status && rows[0] && "status" in rows[0]) rows = rows.filter((r) => r.status === filters.status);
      if (filters.category && filters.category !== "All") rows = rows.filter((r) => r.category === filters.category);
      if (filters.search) rows = rows.filter((r) => r.title?.toLowerCase().includes(filters.search.toLowerCase()));
      return rows;
    },
    async getBySlug(slug) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from(table).select("*").eq("slug", slug).single();
        if (error) throw error;
        return data;
      }
      await wait(200);
      return clone(_store).find((r) => r.slug === slug) || null;
    },
    async getById(id) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
        if (error) throw error;
        return data;
      }
      return clone(_store).find((r) => r.id === id) || null;
    },
    async create(row) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from(table).insert(row).select().single();
        if (error) throw error;
        return data;
      }
      await wait(200);
      const newRow = { ...row, id: row.id || `tmp-${Date.now()}` };
      _store.push(newRow);
      return clone(newRow);
    },
    async update(id, patch) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from(table).update(patch).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      await wait(200);
      const idx = _store.findIndex((r) => r.id === id);
      if (idx !== -1) Object.assign(_store[idx], patch);
      return idx !== -1 ? clone(_store[idx]) : { id, ...patch };
    },
    async remove(id) {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
      }
      const idx = _store.findIndex((r) => r.id === id);
      if (idx !== -1) _store.splice(idx, 1);
      await wait(200);
      return true;
    },
  };
}

/* ─── Blog service ────────────────────────────────────── */
export const blogService = {
  ...makeService("blogs", seed.blogs, { orderBy: "publish_at", desc: true }),
  async featured() { const all = await this.list({ status: "published" }); return all.find((b) => b.featured) || all[0] || null; },
  async related(slug, category, limit = 3) { const all = await this.list({ category, status: "published" }); return all.filter((b) => b.slug !== slug).slice(0, limit); },
  async categories() { const all = await this.list({ status: "published" }); return ["All", ...new Set(all.map((b) => b.category))]; },
};

/* ─── Event service ───────────────────────────────────── */
export const eventService = {
  ...makeService("events", seed.events, { orderBy: "starts_at", desc: false }),
  async upcoming() { const all = await this.list(); return all.filter((e) => new Date(e.starts_at).getTime() >= Date.now()); },
  async past() { const all = await this.list(); return all.filter((e) => new Date(e.starts_at).getTime() < Date.now()); },
};

/* ─── Gallery service ─────────────────────────────────── */
export const galleryService = {
  ...makeService("gallery", seed.gallery, { orderBy: "created_at", desc: true }),
  async albums() { const all = await this.list({ status: null }); return ["All", ...new Set(all.map((g) => g.album))]; },
};

/* ─── Testimonial service ─────────────────────────────── */
export const testimonialService = {
  ...makeService("testimonials", seed.testimonials),
  async featuredFirst() { const all = await this.list({ status: null }); return [...all].sort((a, b) => Number(b.featured) - Number(a.featured)); },
};

/* ─── Notification service ────────────────────────────── */
const _notifications = clone(seed.notifications || []);
export const notificationService = {
  async list() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
    await wait(200);
    return clone(_notifications);
  },
  async active() {
    // Fetch every switched-on notice, then apply the date window here. Doing it in the
    // database query would silently drop notices whose dates were left empty.
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("notifications").select("*")
        .eq("active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).filter((n) => isLive(n));
    }
    const all = await this.list();
    return all.filter((n) => n.active && isLive(n));
  },
  async create(row) {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("notifications").insert(row).select().single(); if (error) throw error; return data; }
    await wait(200); const n = { ...row, id: `n-${Date.now()}` }; _notifications.push(n); return clone(n);
  },
  async update(id, patch) {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("notifications").update(patch).eq("id", id).select().single(); if (error) throw error; return data; }
    await wait(200); const idx = _notifications.findIndex((r) => r.id === id); if (idx !== -1) Object.assign(_notifications[idx], patch); return idx !== -1 ? clone(_notifications[idx]) : { id, ...patch };
  },
  async remove(id) {
    if (isSupabaseConfigured) { const { error } = await supabase.from("notifications").delete().eq("id", id); if (error) throw error; }
    const idx = _notifications.findIndex((r) => r.id === id); if (idx !== -1) _notifications.splice(idx, 1); await wait(180); return true;
  },
};

/* ─── Site settings service ───────────────────────────── */
const _siteSettings = clone(seed.siteSettings || []);
export const siteSettingsService = {
  async list() {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("site_settings").select("*"); if (error) throw error; return data || []; }
    await wait(200); return clone(_siteSettings);
  },
  async getByKey(key) { const all = await this.list(); return all.find((s) => s.key === key) || null; },
  async getByGroup(group) { const all = await this.list(); return all.filter((s) => s.group === group); },
  async update(id, patch) {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("site_settings").update(patch).eq("id", id).select().single(); if (error) throw error; return data; }
    await wait(200); const idx = _siteSettings.findIndex((r) => r.id === id); if (idx !== -1) Object.assign(_siteSettings[idx], patch); return idx !== -1 ? clone(_siteSettings[idx]) : { id, ...patch };
  },
  async increment(key, amount = 1) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc("increment_setting", { setting_key: key, amount });
      if (!error && data) return data;
    }
    const item = _siteSettings.find((s) => s.key === key);
    if (item) { item.value = (Number(item.value) || 0) + amount; return clone(item); }
    return null;
  },
};

/* ─── User management service ─────────────────────────── */
const _users = clone(seed.users || []);
export const userService = {
  async list() {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("users").select("id, email, username, name, phone, role, created_at").order("created_at", { ascending: false }); if (error) throw error; return data || []; }
    await wait(200); return _users.map(({ password, ...rest }) => rest);
  },
  async getById(id) {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("users").select("*").eq("id", id).single(); if (error) throw error; return data; }
    return _users.find((u) => u.id === id) || null;
  },
  async updateRole(id, role) {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("users").update({ role }).eq("id", id).select().single(); if (error) throw error; return data; }
    await wait(200); const idx = _users.findIndex((u) => u.id === id); if (idx !== -1) _users[idx].role = role; return idx !== -1 ? { ..._users[idx], password: undefined } : null;
  },
};

/* ── Admin-managed logins ─────────────────────────────────
   Only the super admin / admins create logins. In real mode this calls
   the `admin-users` Edge Function (which holds the secret key and checks
   the caller is an admin). In demo mode it works on in-memory users, so
   a login you create can really be used to sign in. */
// Supabase's editor suggests a random name (e.g. "clever-responder"). If you deployed under
// another name, set VITE_ADMIN_FUNCTION_NAME instead of redeploying.
const ADMIN_FUNCTION = import.meta.env.VITE_ADMIN_FUNCTION_NAME || "admin-users";

async function invokeAdminUsers(body) {
  const { data, error } = await supabase.functions.invoke(ADMIN_FUNCTION, { body });
  if (error) {
    // Work out the REAL reason instead of one vague message
    const status = error.context?.status;
    let payload = null;
    try { payload = await error.context?.json?.(); } catch { /* not JSON */ }

    let msg;
    if (payload?.error) {
      msg = payload.error;                                   // our function's own message
    } else if (status === 404 || payload?.code === "NOT_FOUND") {
      msg = `Supabase says the function '${ADMIN_FUNCTION}' does not exist in this project. Check it is deployed in the SAME project as VITE_SUPABASE_URL, and that its name matches (admin-users, or VITE_ADMIN_FUNCTION_NAME).`;
    } else if (payload?.code === "BOOT_ERROR" || status === 503) {
      msg = `The admin-users function was found but failed to start${payload?.message ? `: ${payload.message}` : ""}. Re-paste supabase/functions/admin-users/index.ts and deploy again.`;
    } else if (status === 401) {
      msg = "Supabase rejected your session (401). Sign out, sign in again, and retry.";
    } else if (error.name === "FunctionsFetchError" || /failed to send a request/i.test(error.message || "")) {
      msg = "The browser could not reach the admin-users function (network or wrong project URL). Check VITE_SUPABASE_URL, that the function is deployed, and open Edge Functions → admin-users → Logs.";
    } else {
      msg = `${error.message || "Function error"}${status ? ` (status ${status})` : ""}`;
    }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const userAdminService = {
  async create({ username, name, password, role = "student", phone = "", student_id = null }) {
    if (isSupabaseConfigured) {
      return invokeAdminUsers({ action: "create", username, name, password, role, phone, student_id });
    }
    await wait(300);
    const u = String(username || "").trim().toLowerCase();
    if (!name?.trim()) throw new Error("Name is required");
    if (!USERNAME_RE.test(u)) throw new Error("User ID must be 3-32 characters: small letters, numbers, dot, dash or underscore (no spaces).");
    if ((password || "").length < 6) throw new Error("Password must be at least 6 characters");
    if (_users.some((x) => (x.username || "").toLowerCase() === u)) throw new Error("This User ID is already taken");
    const row = { id: `u-${Date.now()}`, email: loginToEmail(u), username: u, name: name.trim(), phone, role, password };
    _users.unshift(row);
    return { ok: true, id: row.id, username: u, name: row.name, role, linked: Boolean(student_id) };
  },

  async resetPassword(id, password) {
    if (isSupabaseConfigured) return invokeAdminUsers({ action: "reset_password", id, password });
    await wait(250);
    if ((password || "").length < 6) throw new Error("Password must be at least 6 characters");
    const u = _users.find((x) => x.id === id);
    if (!u) throw new Error("User not found");
    u.password = password;
    return { ok: true };
  },

  async remove(id) {
    if (isSupabaseConfigured) return invokeAdminUsers({ action: "delete", id });
    await wait(200);
    const idx = _users.findIndex((x) => x.id === id);
    if (idx !== -1) _users.splice(idx, 1);
    return { ok: true };
  },

  /** Is the Edge Function deployed + am I an admin? (used by /auth-check) */
  async ping() {
    return invokeAdminUsers({ action: "ping" });
  },
};

/** Demo-mode sign-in lookup (never used when Supabase is connected) */
export const findDemoUser = (identifier, password) => {
  const id = String(identifier || "").trim().toLowerCase();
  return _users.find(
    (u) => ((u.username || "").toLowerCase() === id || (u.email || "").toLowerCase() === id) && u.password === password
  ) || null;
};

/* ── Site config (admin-editable contact/social details) ── */
const SITE_CONFIG_SEED = [
  { key: "contact_phone",    value: "(+91) 7873987123",                        label: "Phone number",           kind: "tel" },
  { key: "contact_email",    value: "siitsurada@gmail.com",                    label: "Email address",          kind: "email" },
  { key: "contact_address",  value: "Main Road, Sorada, Ganjam, Odisha",       label: "Address",                kind: "text" },
  { key: "whatsapp_number",  value: "917873987123",                            label: "WhatsApp number",        kind: "tel" },
  { key: "map_embed_url",    value: "",                                        label: "Google Maps embed URL",  kind: "url" },
  { key: "social_facebook",  value: "",                                        label: "Facebook URL",           kind: "url" },
  { key: "social_instagram", value: "https://instagram.com/oscit_siit_surada", label: "Instagram URL",          kind: "url" },
  { key: "social_youtube",   value: "",                                        label: "YouTube URL",            kind: "url" },
  { key: "social_twitter",   value: "",                                        label: "Twitter / X URL",        kind: "url" },
  { key: "timing_weekday",   value: "9:00 AM – 7:00 PM",                       label: "Timings — Mon to Fri",   kind: "text" },
  { key: "timing_saturday",  value: "9:00 AM – 2:00 PM",                       label: "Timings — Saturday",     kind: "text" },
  { key: "timing_sunday",    value: "Closed",                                  label: "Timings — Sunday",       kind: "text" },
];
const _siteConfig = clone(SITE_CONFIG_SEED);

export const siteConfigService = {
  async list() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("site_config").select("*");
      if (error) throw error;
      return data || [];
    }
    await wait(180);
    return clone(_siteConfig);
  },

  /** Return config as a flat { key: value } map for easy consumption */
  async map() {
    const rows = await this.list();
    return rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
  },

  async update(key, value) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("site_config").update({ value }).eq("key", key).select().single();
      if (error) throw error;
      return data;
    }
    await wait(150);
    const row = _siteConfig.find((r) => r.key === key);
    if (row) row.value = value;
    return row ? clone(row) : { key, value };
  },

  /** For the admin page: every known setting, even one whose row is missing in the database. */
  async listForAdmin() {
    const rows = await this.list();
    const have = new Set(rows.map((r) => r.key));
    const merged = [...rows, ...SITE_CONFIG_SEED.filter((d) => !have.has(d.key)).map((d) => ({ ...d }))];
    const order = (k) => { const i = SITE_CONFIG_SEED.findIndex((d) => d.key === k); return i === -1 ? 999 : i; };
    return merged.sort((x, y) => order(x.key) - order(y.key));
  },

  /** Save many settings. Creates a missing row instead of silently doing nothing, and
      refuses to say "saved" unless the database confirms every row. */
  async saveAll(items) {
    if (isSupabaseConfigured) {
      const payload = items.map((i) => ({ key: i.key, value: i.value ?? "", label: i.label ?? "", kind: i.kind ?? "text" }));
      const { data, error } = await supabase.from("site_config").upsert(payload, { onConflict: "key" }).select();
      if (error) throw error;
      if (!data || data.length < payload.length) {
        throw new Error(`Only ${data?.length || 0} of ${payload.length} settings were saved. The database refused the rest. Your login probably needs an admin role.`);
      }
      return true;
    }
    items.forEach((i) => {
      const row = _siteConfig.find((r) => r.key === i.key);
      if (row) row.value = i.value;
    });
    await wait(200);
    return true;
  },
};
