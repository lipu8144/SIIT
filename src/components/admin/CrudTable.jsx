import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

/**
 * SIIT — CrudTable + CrudModal
 * Generic admin table with search, add/edit/delete, modal form.
 * Used by every admin module so the UI is consistent.
 *
 * Props for CrudTable:
 *   title      — section heading
 *   columns    — [{ key, label, render? }]
 *   rows       — data array (state managed by parent)
 *   onAdd      — () => opens blank form
 *   onEdit     — (row) => opens filled form
 *   onDelete   — async (id) => removes row
 *   searchKeys — [key, ...] to filter rows on
 *
 * Props for CrudModal:
 *   open, onClose, title, onSubmit, loading, children
 */

export const CrudTable = ({
  title,
  columns = [],
  rows = [],
  onAdd,
  onEdit,
  onDelete,
  searchKeys = [],
  addLabel = "Add New",
}) => {
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(null);

  const filtered = rows.filter((r) =>
    searchKeys.some((k) =>
      String(r[k] ?? "").toLowerCase().includes(query.toLowerCase())
    )
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setDeleting(id);
    try { await onDelete(id); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-medium">{title}</h1>
        <button
          onClick={onAdd}
          className="btn-dark inline-flex items-center gap-2 text-sm"
        >
          <FaPlus size={11} /> {addLabel}
        </button>
      </div>

      {/* search */}
      <div className="mb-4 flex max-w-sm items-center gap-2 rounded-full border border-[#1c3fbd]/15 bg-white px-4 py-2">
        <FaSearch className="text-[#1c3fbd]" size={13} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-grey bg-body">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-dark-grey">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-dark-grey">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-10 text-center text-dark-grey">
                  No items found.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-b border-grey/50 transition hover:bg-body/50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onEdit(row)}
                      className="mr-2 rounded-lg p-1.5 text-[#1c3fbd] hover:bg-[#1c3fbd]/10"
                      aria-label="Edit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={deleting === row.id}
                      className="rounded-lg p-1.5 text-buttons_1 hover:bg-buttons_1/10 disabled:opacity-40"
                      aria-label="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CrudModal = ({ open, onClose, title, onSubmit, loading = false, formKey, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex overflow-y-auto bg-black/45 p-4"
      >
        <motion.div
          initial={{ scale: 0.94, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="m-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white"
        >
          <div className="flex items-center justify-between border-b border-grey px-6 py-4">
            <h2 className="text-lg font-medium">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-dark-grey hover:bg-grey">
              <FaTimes />
            </button>
          </div>
          {/* key forces React to remount the form when switching between add/edit */}
          <form key={formKey} onSubmit={onSubmit} className="p-6">
            <div className="flex flex-col gap-4">{children}</div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="rounded-full border border-grey px-5 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-dark text-sm disabled:opacity-60">
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* Shared field style for admin forms */
export const FIELD = "w-full rounded-lg border border-[#1c3fbd]/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1c3fbd] focus:ring-2 focus:ring-[#1c3fbd]/20";

export const FormField = ({ label, required, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium">
      {label}{required && <span className="ml-0.5 text-buttons_1">*</span>}
    </label>
    {children}
  </div>
);
