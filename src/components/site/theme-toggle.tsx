"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alterna el modo claro/oscuro de la app.
 *
 * El tema se guarda en una cookie que el servidor lee para aplicar la clase
 * `dark` en <html> (sin flash, sin scripts inline). Acá alternamos la clase al
 * instante y persistimos la cookie.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="nav-icon relative inline-flex h-11 w-11 items-center justify-center"
    >
      <Sun
        strokeWidth={1.5}
        className={cn(
          "h-5 w-5 transition-all duration-500 ease-[var(--ease-smooth)]",
          mounted && isDark
            ? "scale-0 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        strokeWidth={1.5}
        className={cn(
          "absolute h-5 w-5 transition-all duration-500 ease-[var(--ease-smooth)]",
          mounted && isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
