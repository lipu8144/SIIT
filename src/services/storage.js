/**
 * SIIT — Storage service (Supabase Storage + dummy fallback)
 * ──────────────────────────────────────────────────────────
 * Uploads files and returns a public URL.
 *
 * Buckets (created by migrations):
 *   avatars · blog-covers · event-covers · gallery · notes
 *
 * In dummy mode (no Supabase keys) it returns a local object URL so
 * the UI preview still works — that URL is temporary and lives only
 * for the current page session.
 */
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export const BUCKETS = {
  avatars: "avatars",
  blogCovers: "blog-covers",
  eventCovers: "event-covers",
  gallery: "gallery",
  notes: "notes",
};

const MAX_MB = 10;

/** Basic client-side guard so we fail fast with a clear message. */
const validate = (file) => {
  if (!file) throw new Error("No file selected");
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`File is larger than ${MAX_MB} MB`);
  }
};

const safeName = (name) =>
  name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");

export const storageService = {
  /**
   * Upload a File to a bucket and return { url, path }.
   * @param {File}   file
   * @param {string} bucket  one of BUCKETS
   * @param {string} folder  optional sub-folder
   */
  async upload(file, bucket = BUCKETS.gallery, folder = "") {
    validate(file);

    if (!isSupabaseConfigured) {
      // Dummy mode: local preview URL (not persisted)
      await new Promise((r) => setTimeout(r, 400));
      return { url: URL.createObjectURL(file), path: file.name, local: true };
    }

    const path = `${folder ? folder.replace(/\/$/, "") + "/" : ""}${Date.now()}-${safeName(file.name)}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, path, local: false };
  },

  /** Delete a previously uploaded file by its storage path. */
  async remove(path, bucket = BUCKETS.gallery) {
    if (!isSupabaseConfigured || !path) return true;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return true;
  },
};

export default storageService;
