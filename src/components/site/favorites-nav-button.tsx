"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useFavorites } from "@/store/favorites";

/** Acceso a la página de favoritos con contador (navbar). */
export function FavoritesNavButton() {
  const items = useFavorites((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.length : 0;

  return (
    <Link
      href="/favoritos"
      aria-label="Favoritos"
      className="nav-icon relative inline-flex h-11 w-11 items-center justify-center"
    >
      <Heart className="h-5 w-5" strokeWidth={1.5} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-fg tabular-nums"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
