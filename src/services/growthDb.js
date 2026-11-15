/**
 * SIIT — Growth service layer (Supabase + dummy fallback)
 * ────────────────────────────────────────────────────────
 * Leads CRM, AI quiz, analytics, SEO meta.
 */
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { leads as SEED_LEADS, quizSubmissions as SEED_QUIZ, analyticsSnapshot, seoMeta as SEED_SEO } from "../data/growthSeed";
import { siteSettingsService } from "./db";

const wait = (ms = 260) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));

/* ── Lead CRM ─────────────────────────────────────────── */
const _leads = clone(SEED_LEADS);
export const leadService = {
  async list(filters = {}) {
    if (isSupabaseConfigured) {
      let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (filters.status) q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    }
    await wait(); let rows = clone(_leads);
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);
    return rows;
  },
  async create(row) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("leads").insert(row).select().single();
      if (error) throw error;
      siteSettingsService.increment("enquiries").catch(() => {});
      return data;
    }
    await wait(200);
    const n = { ...row, id: `l-${Date.now()}`, created_at: new Date().toISOString() };
    _leads.push(n);
    siteSettingsService.increment("enquiries").catch(() => {});
    return clone(n);
  },
  async update(id, patch) {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select().single(); if (error) throw error; return data; }
    await wait(200); const idx = _leads.findIndex((r) => r.id === id); if (idx !== -1) Object.assign(_leads[idx], patch); return idx !== -1 ? clone(_leads[idx]) : { id, ...patch };
  },
  async remove(id) {
    if (isSupabaseConfigured) { const { error } = await supabase.from("leads").delete().eq("id", id); if (error) throw error; }
    const idx = _leads.findIndex((r) => r.id === id); if (idx !== -1) _leads.splice(idx, 1); await wait(180); return true;
  },
  async stats() {
    const all = await this.list();
    const total = all.length;
    const converted = all.filter((l) => l.status === "converted").length;
    return {
      total, new: all.filter((l) => l.status === "new").length,
      contacted: all.filter((l) => l.status === "contacted").length,
      interested: all.filter((l) => l.status === "interested").length,
      follow_up: all.filter((l) => l.status === "follow_up").length,
      converted, conversionRate: total ? Math.round((converted / total) * 100) : 0,
    };
  },
};

/* ── AI Quiz ──────────────────────────────────────────── */
const _quizSubs = clone(SEED_QUIZ);
export const quizService = {
  async submit(answers) {
    const recommended = recommend(answers);
    const row = { answers, recommended_courses: recommended, converted: false, created_at: new Date().toISOString() };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("quiz_submissions").insert(row).select().single();
      if (error) throw error;
      return { ...data, recommended_courses: recommended };
    }
    await wait(300);
    const n = { id: `q-${Date.now()}`, ...row };
    _quizSubs.push(n);
    return clone(n);
  },
  async list() {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("quiz_submissions").select("*").order("created_at", { ascending: false }); if (error) throw error; return data || []; }
    await wait(); return clone(_quizSubs);
  },
  async stats() {
    const all = await this.list();
    return { total: all.length, converted: all.filter((q) => q.converted).length, rate: all.length ? Math.round((all.filter((q) => q.converted).length / all.length) * 100) : 0 };
  },
};

function recommend(answers) {
  const { interest = 0 } = answers;
  const MATRIX = {
    0: { primary: "Tally with GST", secondary: "Advanced Excel", alt: "MS-Excel" },
    1: { primary: "Photoshop", secondary: "Blender", alt: "Graphic Design" },
    2: { primary: "JAVA", secondary: "C++", alt: "C" },
    3: { primary: "OS-CIT", secondary: "MS-Office", alt: "Advanced Excel" },
  };
  const base = MATRIX[interest] || MATRIX[3];
  return [base.primary, base.secondary, base.alt].slice(0, 3);
}

/* ── Analytics ────────────────────────────────────────── */
export const analyticsService = {
  async getSnapshot() {
    // Start from the illustrative shape (traffic metrics like device split
    // and bounce rate genuinely require GA4 — see note below).
    const snap = clone(analyticsSnapshot);

    if (isSupabaseConfigured) {
      try {
        // Real numbers we CAN compute from our own database:
        const [leads, students, pageVisitsRow, enquiriesRow] = await Promise.all([
          supabase.from("leads").select("id, status, created_at"),
          supabase.from("students").select("id"),
          supabase.from("site_settings").select("value").eq("key", "page_visits").single(),
          supabase.from("site_settings").select("value").eq("key", "enquiries").single(),
        ]);

        const leadRows = leads.data || [];
        const totalLeads = leadRows.length;
        const converted = leadRows.filter((l) => l.status === "converted").length;

        // Overwrite the parts that are real
        snap.overview.totalVisitors = Number(pageVisitsRow.data?.value) || snap.overview.totalVisitors;
        snap.realStats = {
          totalLeads,
          converted,
          conversionRate: totalLeads ? Math.round((converted / totalLeads) * 100) : 0,
          totalStudents: (students.data || []).length,
          totalEnquiries: Number(enquiriesRow.data?.value) || totalLeads,
        };

        // Real lead status funnel
        snap.leadFunnel = ["new", "contacted", "interested", "follow_up", "converted"].map((s) => ({
          stage: s,
          count: leadRows.filter((l) => l.status === s).length,
        }));
      } catch (e) {
        console.warn("Analytics: some real stats unavailable, using illustrative data.", e);
      }
    }

    await wait(300);
    return snap;
  },
};

/*
 * NOTE ON ANALYTICS:
 * Visitor traffic metrics (device breakdown, traffic sources, bounce rate,
 * session duration, per-day visitor trend) cannot be derived from the app
 * database — they require a real analytics provider. To make these live:
 *   1. Add Google Analytics 4 (set VITE_GA4_MEASUREMENT_ID) for collection.
 *   2. Pull figures via the GA4 Data API from a Supabase Edge Function, or
 *      show them directly in the GA dashboard.
 * Until then, those specific charts show illustrative data, while leads,
 * students, conversions, enquiries and page-visits are REAL from the DB.
 */

/* ── SEO meta ─────────────────────────────────────────── */
const _seoMeta = clone(SEED_SEO);
export const seoService = {
  async list() {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("seo_meta").select("*"); if (error) throw error; return data || []; }
    await wait(); return clone(_seoMeta);
  },
  async update(id, patch) {
    if (isSupabaseConfigured) { const { data, error } = await supabase.from("seo_meta").update(patch).eq("id", id).select().single(); if (error) throw error; return data; }
    await wait(200); const idx = _seoMeta.findIndex((r) => r.id === id); if (idx !== -1) Object.assign(_seoMeta[idx], patch); return idx !== -1 ? clone(_seoMeta[idx]) : { id, ...patch };
  },
};
