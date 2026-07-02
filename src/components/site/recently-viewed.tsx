"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRecent } from "@/store/recent";
import { formatMoney } from "@/lib/money";

/**
 * Carrusel de productos vistos recientemente (desde localStorage).
 * Se oculta si no hay historial. `excludeId` evita mostrar el producto actual.
 */
export function RecentlyViewed({
  excludeId,
  title = "Vistos recientemente",
  max = 6,
}: {
  excludeId?: string;
  title?: string;
  max?: number;
}) {
  const items = useRecent((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const list = items.filter((i) => i.id !== excludeId).slice(0, max);
  if (list.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-20">
      <h2 className="mb-8 font-heading text-2xl md:text-3xl">{title}</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {list.map((p) => (
          <Link key={p.id} href={`/producto/${p.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-brand bg-fg/5">
              {p.imageUrl && (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 16vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-smooth)] group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-3 truncate text-sm font-medium transition-colors group-hover:text-primary">
              {p.name}
            </p>
            <span className="text-sm tabular-nums text-muted">
              {formatMoney(p.price, p.currency)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
