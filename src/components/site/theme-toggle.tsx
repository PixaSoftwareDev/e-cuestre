"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alterna el modo claro/oscuro de la app.
 *
 * El tema real lo aplica un script inline en el <head> (ver layout raíz) antes
 * del primer paint, para no tener flash. Acá solo sincronizamos el estado al
 * montar y alternamos la clase `dark` en <html>, guardando la preferencia.
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
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* localStorage bloqueado: no pasa nada, se pierde la persistencia */
    }
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
