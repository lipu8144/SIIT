/**
 * SIIT — Loader
 * A lightweight branded spinner used as the Suspense fallback and by
 * pages while async data resolves.
 */
const Loader = () => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 rounded-full border-4 border-buttons_1/20" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-buttons_1" />
      </div>
      <p className="text-sm font-medium text-text_color2/70">Loading…</p>
    </div>
  );
};

export default Loader;
