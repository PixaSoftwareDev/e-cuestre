"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Hero de la página de marca: parallax leve + entrada escalonada del texto. */
export function BrandHero({
  imageUrl,
  name,
  tagline,
}: {
  imageUrl?: string | null;
  name: string;
  tagline?: string | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-[62vh] items-end overflow-hidden"
    >
      <motion.div style={{ y: imgY }} className="absolute inset-[-8%_0]">
        <motion.div
          initial={{ scale: reduce ? 1 : 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-primary" />
          )}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.14, delayChildren: 0.1 }}
        className="container-page relative z-10 pb-16 text-white"
      >
        <motion.p variants={item} className="kicker mb-3 text-white/70">
          Nuestra casa
        </motion.p>
        <motion.h1 variants={item} className="font-heading text-4xl md:text-6xl">
          {name}
        </motion.h1>
        {tagline && (
          <motion.p
            variants={item}
            className="mt-3 max-w-xl text-lg text-white/85"
          >
            {tagline}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
