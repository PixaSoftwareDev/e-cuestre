"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useFavorites, type FavItem } from "@/store/favorites";
import { cn } from "@/lib/utils";

/**
 * Botón "me gusta" / favorito. Persiste en localStorage (store de favoritos).
 * `variant="icon"` → solo el corazón (para tarjetas). `variant="button"` →
 * corazón + texto (para la ficha de producto).
 */
export function FavoriteButton({
  item,
  variant = "icon",
  className,
}: {
  item: FavItem;
  variant?: "icon" | "button" | "card";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isFav = useFavorites((s) => s.items.some((i) => i.id === item.id));
  const toggle = useFavorites((s) => s.toggle);
  const active = mounted && isFav;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  }

  const heartColor =
    variant === "card"
      ? cn(
          "text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]",
          active && "fill-white",
        )
      : active
        ? "fill-primary text-primary"
        : "text-fg";

  const heart = (
    <motion.span
      key={active ? "on" : "off"}
      initial={{ scale: 0.6 }}
      animate={{ scale: active ? [1, 1.35, 1] : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex"
    >
      <Heart
        className={cn("h-5 w-5 transition-colors", heartColor)}
        strokeWidth={1.6}
      />
    </motion.span>
  );

  // Variante para tarjetas: sin fondo, oculto y aparece al hover de la tarjeta
  // (que es `group`). Si ya es favorito, queda siempre visible.
  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center transition-opacity duration-300",
          active
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          className,
        )}
      >
        {heart}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-brand border px-5 text-sm font-medium transition-colors",
          active
            ? "border-primary text-primary"
            : "border-border text-fg hover:border-fg/40",
          className,
        )}
      >
        {heart}
        {active ? "En favoritos" : "Favorito"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={cn(
        "nav-icon inline-flex h-11 w-11 items-center justify-center bg-bg/80 backdrop-blur-sm",
        className,
      )}
    >
      {heart}
    </button>
  );
}
