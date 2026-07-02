"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barra fina arriba que indica el progreso de scroll de la página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[55] h-0.5 w-full origin-left bg-primary"
    />
  );
}
