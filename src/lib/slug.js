/** "Is AI Safe? A Student's Guide" -> "is-ai-safe-a-students-guide" (safe in a URL) */
export const slugify = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
