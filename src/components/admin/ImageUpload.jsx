import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaUpload, FaLink, FaTimes, FaSpinner } from "react-icons/fa";

import { storageService, BUCKETS } from "../../services/storage";

/**
 * SIIT — ImageUpload
 * Dual-mode media field for admin forms:
 *   • Upload a file → Supabase Storage → public URL
 *   • Or paste an existing URL
 *
 * Controlled: pass `value` (the URL) and `onChange(url)`.
 * The parent keeps the URL in state and submits it like any other field.
 *
 * Props:
 *   value, onChange, bucket, folder, label, accept, hint
 */
const ImageUpload = ({
  value = "",
  onChange,
  bucket = BUCKETS.gallery,
  folder = "",
  accept = "image/*",
  hint = "PNG, JPG or WEBP · max 10 MB",
}) => {
  const fileRef = useRef();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("upload"); // upload | url

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { url, local } = await storageService.upload(file, bucket, folder);
      onChange(url);
      toast.success(local ? "Preview ready (connect Supabase to store permanently)" : "Uploaded");
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isImage = accept.startsWith("image");

  return (
    <div>
      {/* mode toggle */}
      <div className="mb-2 flex gap-1 rounded-lg bg-body p-1 text-xs">
        {[
          { id: "upload", label: "Upload file", Icon: FaUpload },
          { id: "url", label: "Paste URL", Icon: FaLink },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 font-medium transition ${
              mode === m.id ? "bg-white text-[#1c3fbd] shadow-sm" : "text-dark-grey"
            }`}
          >
            <m.Icon size={11} /> {m.label}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            disabled={busy}
            className="block w-full text-xs text-dark-grey file:mr-3 file:rounded-full file:border-0 file:bg-[#1c3fbd]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#1c3fbd] hover:file:bg-[#1c3fbd]/20"
          />
          {busy && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#1c3fbd]">
              <FaSpinner className="animate-spin" size={10} /> Uploading…
            </p>
          )}
        </div>
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border border-[#1c3fbd]/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1c3fbd] focus:ring-2 focus:ring-[#1c3fbd]/20"
        />
      )}

      <p className="mt-1 text-xs text-dark-grey">{hint}</p>

      {/* preview */}
      {value && (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-grey p-2">
          {isImage ? (
            <img
              src={value}
              alt="preview"
              className="h-14 w-14 shrink-0 rounded-md object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-body text-xs text-dark-grey">
              file
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-xs text-dark-grey">{value}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 rounded-md p-1.5 text-dark-grey hover:bg-body"
            aria-label="Remove"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
