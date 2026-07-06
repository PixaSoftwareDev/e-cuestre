"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { withBasePath } from "@/lib/base-path";

/**
 * Intro de carga: logo centrado con entrada (blur → nítido + escala), barra de
 * progreso y salida tipo cortina hacia arriba. Aparece en la carga/recarga de
 * la web (no en la navegación interna, porque el layout no se re-monta).
 */
export function SplashScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setDone(true), 1750);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = "";
      }}
    >
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <Image
              src={withBasePath("/logo-negro.png")}
              alt="Ecuestre"
              width={140}
              height={134}
              sizes="140px"
              priority
              className="h-24 w-auto md:h-28 dark:hidden"
            />
            <Image
              src={withBasePath("/logo-blanco.png")}
              alt="Ecuestre"
              width={140}
              height={134}
              sizes="140px"
              priority
              className="hidden h-24 w-auto md:h-28 dark:block"
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 font-heading text-3xl tracking-tight md:text-4xl"
            >
              <span className="text-accent">E</span>
              <span className="mx-[0.12em] text-accent">-</span>
              <span className="text-fg">cuestre</span>
            </motion.div>
          </motion.div>

          {/* Barra de progreso */}
          <div className="mt-9 h-0.5 w-40 overflow-hidden rounded-full bg-fg/10">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
