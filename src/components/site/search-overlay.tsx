"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, CornerDownLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSearch } from "@/store/search";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string | null;
  price: number;
  currency: string;
};

export function SearchOverlay() {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Atajo global Ctrl/⌘+K para abrir.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // Al abrir: foco + bloquear scroll. Al cerrar: limpiar.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = "";
      };
    } else {
      setQuery("");
      setResults([]);
      setActive(0);
    }
  }, [open]);

  // Búsqueda con debounce.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
      } catch {
        /* abortado o error de red */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  function go(r: Result) {
    setOpen(false);
    router.push(`/producto/${r.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) go(r);
    }
  }

  const showEmpty =
    query.trim().length >= 2 && !loading && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-label="Buscar productos"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[12vh] z-[61] w-[92vw] max-w-2xl -translate-x-1/2 overflow-hidden rounded-brand border border-border bg-bg shadow-[var(--shadow-lift)]"
            onKeyDown={onKeyDown}
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.5} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos, marcas…"
                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="nav-icon inline-flex h-9 w-9 shrink-0 items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Resultados */}
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {loading && (
                <div className="space-y-2 p-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <div className="h-14 w-12 shrink-0 rounded-brand skeleton" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded skeleton" />
                        <div className="h-4 w-2/3 rounded skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading &&
                results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => go(r)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-brand p-2 text-left transition-colors",
                      i === active ? "bg-fg/5" : "hover:bg-fg/5",
                    )}
                  >
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-brand bg-fg/5">
                      {r.image && (
                        <Image
                          src={r.image}
                          alt={r.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="kicker text-muted">{r.brand}</p>
                      <p className="truncate text-sm font-medium">{r.name}</p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-muted">
                      {formatMoney(r.price, r.currency)}
                    </span>
                  </button>
                ))}

              {showEmpty && (
                <p className="px-3 py-10 text-center text-sm text-muted">
                  No encontramos resultados para “{query}”.
                </p>
              )}

              {query.trim().length < 2 && !loading && (
                <p className="px-3 py-10 text-center text-sm text-muted">
                  Escribí para buscar en el catálogo.
                </p>
              )}
            </div>

            {/* Pie con hints */}
            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> abrir
              </span>
              <span>↑↓ navegar</span>
              <span>Esc cerrar</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
