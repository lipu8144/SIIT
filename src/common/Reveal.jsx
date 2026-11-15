import { memo } from "react";
import { motion } from "framer-motion";

/**
 * SIIT — Reveal
 * Reusable scroll-into-view animation. Wrap any section or card.
 *   <Reveal>...</Reveal>                       // fade-up once on scroll
 *   <Reveal index={i}>...</Reveal>             // staggered (grids/lists)
 *   <Reveal as="section" className="...">      // render as another tag
 * Respects prefers-reduced-motion automatically via Framer Motion.
 */
const variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.21, 0.6, 0.35, 1] },
  }),
};

const Reveal = ({ children, className, index = 0, as = "div", amount = 0.2 }) => {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      variants={variants}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </M>
  );
};

export default memo(Reveal);
