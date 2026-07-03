"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { AR_CITIES } from "@/lib/ar-cities";

/**
 * Autocompletado de ciudad con estilo propio (no el datalist nativo).
 * Sugiere de la lista al escribir, pero permite cualquier valor.
 */
export function CityCombobox({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const q = value.trim().toLowerCase();
  const suggestions =
    q.length >= 1
      ? AR_CITIES.filter((c) => c.toLowerCase().includes(q))
          .filter((c) => c.toLowerCase() !== q)
          .slice(0, 6)
      : [];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Empezá a escribir…"
        autoComplete="off"
      />
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-brand border border-border bg-bg p-1 shadow-[var(--shadow-lift)]"
          >
            {suggestions.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className="block w-full rounded-brand px-3 py-2 text-left text-sm transition-colors hover:bg-fg/5"
                >
                  {c}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
