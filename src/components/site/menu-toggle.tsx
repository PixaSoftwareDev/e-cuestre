"use client";

import { cn } from "@/lib/utils";

/**
 * Botón hamburguesa animado: las 3 líneas se transforman en una X al abrir.
 * El color se controla con `className` (usa currentColor en las líneas).
 */
export function MenuToggle({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  const line =
    "block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ease-[var(--ease-smooth)]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={open}
      className={cn(
        "relative z-[60] inline-flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full transition-colors active:scale-90 md:hidden",
        className,
      )}
    >
      <span className={cn(line, open && "translate-y-[7px] rotate-45")} />
      <span className={cn(line, open && "scale-x-0 opacity-0")} />
      <span className={cn(line, open && "-translate-y-[7px] -rotate-45")} />
    </button>
  );
}
