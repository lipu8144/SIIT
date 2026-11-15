/**
 * SIIT — Branded logo component
 * Uses the exact color scheme: S(blue) i(red) i(orange) T(sky)
 * in Gelasio font. Use everywhere SIIT appears.
 *
 * Props:
 *   size — "xs" | "sm" | "md" | "lg" | "xl"  (default "md")
 *   className — extra classes on the wrapper span
 *   tag — optional tag text after the logo (e.g. "Admin", "Student Portal")
 */

const SIZES = {
  xs: "text-lg",
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl md:text-7xl",
  xl: "text-6xl md:text-8xl",
};

const TAG_SIZES = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-sm",
  xl: "text-base",
};

const SiitLogo = ({ size = "md", className = "", tag = "" }) => {
  const s = SIZES[size] || SIZES.md;
  const ts = TAG_SIZES[size] || TAG_SIZES.md;

  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className={`font-gelasio font-bold text-[#1c3fbd] ${s}`}>
        S
        <span className="text-[#eb0249]">i</span>
        <span className="text-[#f18032]">i</span>
        <span className="text-[#1DA1F2]">T</span>
      </span>
      {tag && (
        <span className={`${ts} font-medium opacity-60`}>{tag}</span>
      )}
    </span>
  );
};

export default SiitLogo;
