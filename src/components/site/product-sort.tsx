"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "newest", label: "Novedades" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "price-asc", label: "Precio: menor a mayor" },
];

/** Selector de orden del catálogo: dropdown moderno que preserva los filtros. */
export function ProductSort({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = OPTIONS.find((o) => o.value === current) ?? OPTIONS[0];

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

  function choose(value: string) {
    const p = new URLSearchParams(params.toString());
    p.set("orden", value);
    setOpen(false);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-brand border border-border bg-card px-3.5 text-sm transition-colors hover:border-fg/40"
      >
        <ArrowUpDown className="h-4 w-4 text-muted" strokeWidth={1.5} />
        <span className="text-muted">Ordenar:</span>
        <span className="font-medium">{active.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition-transform duration-300",
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
            className="absolute right-0 z-30 mt-2 min-w-56 overflow-hidden rounded-brand border border-border bg-bg p-1 shadow-[var(--shadow-lift)]"
          >
            {OPTIONS.map((o) => {
              const isActive = o.value === active.value;
              return (
                <li key={o.value}>
                  <button
                    role="option"
                    aria-selected={isActive}
                    onClick={() => choose(o.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-brand px-3 py-2 text-sm transition-colors",
                      isActive ? "text-primary" : "text-fg hover:bg-fg/5",
                    )}
                  >
                    {o.label}
                    {isActive && <Check className="h-4 w-4" strokeWidth={2} />}
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
