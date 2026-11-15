import { AnimatePresence, motion } from "framer-motion";

/**
 * SIIT — AnimationWrapper
 * --------------------------------------------------------------
 * Wraps a page (or section) in a Framer Motion fade/slide transition.
 * Used by pages so route changes animate consistently.
 *
 * Props:
 *   keyValue    — unique key to retrigger the animation on change
 *   initial     — starting opacity (default 0)
 *   animate     — { opacity, ... } target (default { opacity: 1 })
 *   transition  — Framer transition object
 *   className   — passthrough class
 */
const AnimationWrapper = ({
  children,
  keyValue,
  initial = { opacity: 0, y: 16 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.5, ease: "easeOut" },
  className = "",
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        exit={{ opacity: 0 }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
