/**
 * Turn a database / network error into a message a person can act on.
 * The admin forms used to show only "Failed to save", which hid the real reason.
 * The full technical error is still printed to the browser console (F12).
 */
export const errText = (err, fallback = "Failed to save") => {
  const m = String(err?.message || err?.error_description || err || "").trim();
  if (!m || m === "[object Object]") return fallback;

  if (/invalid input syntax for type uuid/i.test(m))
    return `${fallback}: a linked item (teacher, course or student) is not valid. Pick one from the list.`;
  if (/could not find the .* column|column .* does not exist/i.test(m))
    return `${fallback}: the database is missing a column. Run the latest SQL migrations. (${m})`;
  if (/row-level security|permission denied/i.test(m))
    return `${fallback}: your login is not allowed to do this. It needs an admin role.`;
  if (/json object requested|multiple \(or no\) rows/i.test(m))
    return `${fallback}: nothing was updated. The row is missing, or your login is not allowed to change it (it needs an admin role).`;
  if (/duplicate key|already exists/i.test(m))
    return `${fallback}: this already exists (duplicate value).`;
  if (/violates foreign key/i.test(m))
    return `${fallback}: a linked record does not exist.`;
  if (/null value in column|violates not-null/i.test(m))
    return `${fallback}: a required field is empty. (${m})`;
  if (/failed to fetch|networkerror|load failed/i.test(m))
    return `${fallback}: could not reach the server. Check your internet connection.`;
  return `${fallback}: ${m}`;
};
