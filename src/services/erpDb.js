/**
 * SIIT — ERP service layer (Supabase + dummy fallback)
 * ────────────────────────────────────────────────────
 * Manages students, teachers, courses, attendance, results.
 */
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { students, teachers, managedCourses, attendance, results } from "../data/erpSeed";

const wait = (ms = 280) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));

function makeErpService(table, seed) {
  const _store = clone(seed);
  return {
    _store,
    async list(filters = {}) {
      if (isSupabaseConfigured) {
        let q = supabase.from(table).select("*");
        Object.entries(filters).forEach(([k, v]) => { if (v) q = q.eq(k, v); });
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
      }
      await wait();
      let rows = clone(_store);
      Object.entries(filters).forEach(([k, v]) => { if (v) rows = rows.filter((r) => String(r[k]) === String(v)); });
      return rows;
    },
    async getById(id) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
        if (error) throw error;
        return data;
      }
      await wait(180);
      const found = _store.find((r) => r.id === id);
      return found ? clone(found) : null;
    },
    async create(row) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from(table).insert(row).select().single();
        if (error) throw error;
        return data;
      }
      await wait(200);
      const newRow = { ...row, id: row.id || `${table.slice(0, 3)}-${Date.now()}` };
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
      await wait(180);
      return true;
    },
    async search(query, keys = ["name"]) {
      const all = await this.list();
      const q = query.toLowerCase();
      return all.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
    },
  };
}

/* ─── Student service ─────────────────────────────────── */
export const studentService = {
  ...makeErpService("students", students),
  async stats() {
    const all = await this.list();
    return { total: all.length, active: all.filter((s) => s.status === "active").length, inactive: all.filter((s) => s.status === "inactive").length };
  },
  /** Find the student record linked to a logged-in auth user */
  async byUserId(userId) {
    if (!userId) return null;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("students").select("*").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data;
    }
    const all = await this.list();
    return all.find((s) => s.user_id === userId) || null;
  },
};

/* ─── Teacher service ─────────────────────────────────── */
export const teacherService = makeErpService("teachers", teachers);

/* ─── Course management service ───────────────────────── */
export const courseManagementService = {
  ...makeErpService("managed_courses", managedCourses),
  async stats() {
    const all = await this.list();
    return { total: all.length, totalSeats: all.reduce((a, c) => a + c.seats, 0), totalEnrolled: all.reduce((a, c) => a + c.enrolled, 0) };
  },
};

/* ─── Attendance service ──────────────────────────────── */
export const attendanceService = {
  ...makeErpService("attendance", attendance),
  async forDate(date) { return (await this.list()).filter((r) => r.date === date); },
  async bulkSave(records) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("attendance").upsert(records, { onConflict: "student_id,date" }).select();
      if (error) throw error;
      return data;
    }
    await wait(300);
    return records.map((r) => {
      const existing = this._store.findIndex((s) => s.student_id === r.student_id && s.date === r.date);
      const row = { ...r, id: r.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
      if (existing !== -1) Object.assign(this._store[existing], row); else this._store.push(row);
      return row;
    });
  },
  async monthlySummary(year, month) {
    const all = await this.list();
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const filtered = all.filter((r) => r.date.startsWith(prefix));
    const map = {};
    filtered.forEach(({ student_id, student_name, status }) => {
      if (!map[student_id]) map[student_id] = { student_id, student_name, present: 0, absent: 0, late: 0 };
      if (status === "P") map[student_id].present++;
      else if (status === "A") map[student_id].absent++;
      else if (status === "L") map[student_id].late++;
    });
    return Object.values(map).map((r) => ({
      ...r, total: r.present + r.absent + r.late,
      rate: r.present + r.absent + r.late > 0 ? Math.round((r.present / (r.present + r.absent + r.late)) * 100) : 0,
    }));
  },
};

/* ─── Result service ──────────────────────────────────── */
export const resultService = {
  ...makeErpService("results", results),
  async forStudent(studentId) { return (await this.list()).filter((r) => r.student_id === studentId); },
  async publish(id) { return this.update(id, { published: true }); },
  async reportCard(studentId) {
    const recs = await this.forStudent(studentId);
    const student = await studentService.getById(studentId);
    if (!recs.length || !student) return null;
    const avg = Math.round(recs.reduce((a, r) => a + (r.marks / r.max_marks) * 100, 0) / recs.length);
    const grade = avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "B+" : avg >= 60 ? "B" : "C";
    return { student, subjects: recs, average: avg, grade };
  },
};

/* ─── Notes / study material service ──────────────────── */
const NOTES_SEED = [
  { id: "nt1", title: "Computer Fundamentals — Chapter 1", type: "pdf",    url: null, course: "OS-CIT",         description: "Introduction to computer hardware and software.", published: true, created_at: "2026-05-10" },
  { id: "nt2", title: "MS-Office Shortcuts Reference",     type: "pdf",    url: null, course: "OS-CIT",         description: "Handy keyboard shortcuts.",                       published: true, created_at: "2026-05-15" },
  { id: "nt3", title: "Tally Data Entry Practice File",    type: "pdf",    url: null, course: "Tally with GST", description: "Practice vouchers and ledger entries.",           published: true, created_at: "2026-05-20" },
  { id: "nt4", title: "Excel VLOOKUP Tutorial",            type: "video",  url: null, course: "Advanced Excel", description: "Step-by-step VLOOKUP walkthrough.",               published: true, created_at: "2026-06-01" },
  { id: "nt5", title: "Assignment — Balance Sheet",        type: "assign", url: null, course: "Tally with GST", description: "Prepare a balance sheet.",                        published: true, created_at: "2026-06-05" },
];

export const noteService = {
  ...makeErpService("notes", NOTES_SEED),
  /** Notes visible to students (published only) */
  async published() {
    const all = await this.list();
    return all.filter((n) => n.published !== false);
  },
};

/* ─── Enrollment service (student ↔ course) ───────────── */
const ENROLL_SEED = [
  { id: "en1", student_id: "s1", course_id: "mc1", status: "active", progress: 65, enrolled_at: "2024-01-10" },
  { id: "en2", student_id: "s1", course_id: "mc4", status: "active", progress: 30, enrolled_at: "2024-02-01" },
  { id: "en3", student_id: "s2", course_id: "mc4", status: "active", progress: 80, enrolled_at: "2024-01-10" },
  { id: "en4", student_id: "s3", course_id: "mc1", status: "active", progress: 45, enrolled_at: "2024-02-05" },
];

export const enrollmentService = {
  ...makeErpService("enrollments", ENROLL_SEED),

  /** All enrollments for a student, joined with course details */
  async forStudent(studentId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, managed_courses(*)")
        .eq("student_id", studentId);
      if (error) throw error;
      return (data || []).map((e) => ({ ...e, course: e.managed_courses }));
    }
    const rows = (await this.list()).filter((e) => e.student_id === studentId);
    const courses = await courseManagementService.list();
    return rows.map((e) => ({ ...e, course: courses.find((c) => c.id === e.course_id) || null }));
  },

  /** All students enrolled in a course */
  async forCourse(courseId) {
    return (await this.list()).filter((e) => e.course_id === courseId);
  },

  /** Enroll a student, ignoring duplicates */
  async enroll(studentId, courseId) {
    const existing = (await this.list()).find(
      (e) => e.student_id === studentId && e.course_id === courseId
    );
    if (existing) return existing;
    return this.create({
      student_id: studentId,
      course_id: courseId,
      status: "active",
      progress: 0,
      enrolled_at: new Date().toISOString().slice(0, 10),
    });
  },
};
