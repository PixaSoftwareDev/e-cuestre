"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type Lang = { code: string; short: string; label: string };

const LANGS: Lang[] = [
  { code: "es-AR", short: "ES", label: "Español (AR)" },
  { code: "en", short: "EN", label: "English" },
  { code: "de", short: "DE", label: "Deutsch" },
];

/**
 * Selector de idioma (widget). Por ahora solo guarda la preferencia y actualiza
 * el atributo lang del <html>; NO traduce el contenido todavía.
 */
export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Lang>(LANGS[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ecuestre-lang");
      const found = LANGS.find((l) => l.code === saved);
      if (found) setCurrent(found);
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  // Cerrar al hacer click afuera o presionar Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(lang: Lang) {
    setCurrent(lang);
    setOpen(false);
    try {
      localStorage.setItem("ecuestre-lang", lang.code);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang.code.split("-")[0];
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Cambiar idioma"
        className="nav-icon inline-flex h-11 items-center gap-1.5 px-2.5"
      >
        <Globe className="h-[18px] w-[18px]" strokeWidth={1.5} />
        <span className="text-xs font-medium tabular-nums">{current.short}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted transition-transform duration-300",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-brand border border-border bg-bg p-1 shadow-[var(--shadow-lift)]"
          >
            {LANGS.map((l) => {
              const active = l.code === current.code;
              return (
                <li key={l.code}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(l)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-[calc(var(--radius-brand))] px-3 py-2 text-sm transition-colors",
                      active ? "text-primary" : "text-fg hover:bg-fg/5",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-6 text-xs font-medium text-muted tabular-nums">
                        {l.short}
                      </span>
                      {l.label}
                    </span>
                    {active && <Check className="h-4 w-4" strokeWidth={2} />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
