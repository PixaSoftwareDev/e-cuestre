"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";

export function SiteHero({
  imageUrl,
  brandSlug,
  brandName,
}: {
  imageUrl?: string | null;
  brandSlug?: string;
  brandName?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const t = useT();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Parallax sutil: la imagen sube un poco más lento que el scroll.
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92vh] items-end overflow-hidden"
    >
      {/* Imagen con parallax (capa un poco más grande para no dejar bordes) */}
      <motion.div style={{ y: imgY }} className="absolute inset-[-7%_0_-7%_0]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black" />
        )}
      </motion.div>

      {/* Degradado para legibilidad */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-page relative z-10 pb-24 text-white md:pb-28"
      >
        <motion.p variants={item} className="kicker mb-4 text-white/75">
          {t("home.hero.kicker")}
        </motion.p>
        <motion.h1
          variants={item}
          className="max-w-3xl font-heading text-4xl leading-[1.03] md:text-6xl lg:text-7xl"
        >
          {t("home.hero.title")}
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-5 max-w-xl text-base text-white/80 md:text-lg"
        >
          {t("home.hero.subtitle")}
        </motion.p>
        <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="accent">
            <Link href="/productos">
              {t("home.hero.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {brandSlug && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:border-white/60"
            >
              <Link href={`/marca/${brandSlug}`}>
                {t("home.hero.brandCta")} {brandName}
              </Link>
            </Button>
          )}
        </motion.div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 md:block"
      >
        <div className="relative h-12 w-px overflow-hidden bg-white/25">
          <div className="animate-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-white/90" />
        </div>
      </motion.div>
    </section>
  );
}
