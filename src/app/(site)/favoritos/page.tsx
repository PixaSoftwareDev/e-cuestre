"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useFavorites } from "@/store/favorites";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";

export default function FavoritosPage() {
  const items = useFavorites((s) => s.items);
  const remove = useFavorites((s) => s.remove);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="container-page py-24" />;

  return (
    <div className="container-page py-12 md:py-16">
      <header className="mb-10">
        <p className="kicker text-accent">Tu selección</p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl">Favoritos</h1>
        <p className="mt-3 text-sm text-muted">
          {items.length}{" "}
          {items.length === 1 ? "producto guardado" : "productos guardados"}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Heart className="h-10 w-10 text-muted" strokeWidth={1} />
          <p className="text-muted">
            Todavía no guardaste ningún favorito.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/productos">Explorar la tienda</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {items.map((p) => (
              <motion.div
                key={p.id}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-brand bg-fg/5 hover-lift">
                  {p.imageUrl && (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.06]"
                    />
                  )}
                  <button
                    onClick={() => remove(p.id)}
                    aria-label="Quitar de favoritos"
                    className="nav-icon absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center bg-bg/80 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="kicker text-muted">{p.brandName}</p>
                  <h3 className="font-heading text-base leading-snug transition-colors group-hover:text-primary">
                    {p.name}
                  </h3>
                  <span className="text-sm tabular-nums">
                    {formatMoney(p.price, p.currency)}
                  </span>
                </div>
                <Link
                  href={`/producto/${p.slug}`}
                  className="absolute inset-0 z-0 rounded-brand"
                  aria-label={p.name}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
