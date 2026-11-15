import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { studentService } from "../services/erpDb";
import { isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * SIIT — useCurrentStudent
 * Resolves the student RECORD id for the logged-in user.
 *
 * Production (Supabase): looks up the students row whose user_id matches
 * the authenticated user, so each student sees ONLY their own data.
 *
 * Demo (no Supabase): falls back to the seed student "s1" so the portal
 * is populated for demonstration.
 *
 * Returns { studentId, student, loading }.
 */
export function useCurrentStudent() {
  const { user } = useAuth();
  const [state, setState] = useState({ studentId: null, student: null, loading: true });

  useEffect(() => {
    let alive = true;

    async function resolve() {
      // Demo mode — no real auth, show the seed student
      if (!isSupabaseConfigured) {
        const s = await studentService.getById("s1");
        if (alive) setState({ studentId: "s1", student: s, loading: false });
        return;
      }

      // Production — find the student row linked to this auth user
      if (!user?.id) {
        if (alive) setState({ studentId: null, student: null, loading: false });
        return;
      }
      try {
        const s = await studentService.byUserId(user.id);
        if (alive) setState({ studentId: s?.id || null, student: s || null, loading: false });
      } catch {
        if (alive) setState({ studentId: null, student: null, loading: false });
      }
    }

    resolve();
    return () => { alive = false; };
  }, [user?.id]);

  return state;
}
