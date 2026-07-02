"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Template (no layout): se re-monta en cada navegación, así el contenido de la
 * tienda aparece con una transición suave al cambiar de página (incluido al
 * pasar de una marca a otra). Fade + leve deslizamiento; respeta
 * prefers-reduced-motion.
 */
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
