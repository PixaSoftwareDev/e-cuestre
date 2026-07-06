import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import {
  getBrands,
  getCategories,
  getProducts,
  type ProductFilters,
} from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { ProductSort } from "@/components/site/product-sort";
import { Reveal } from "@/components/site/reveal";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tienda" };

type SearchParams = Promise<{
  marca?: string;
  categoria?: string;
  q?: string;
  orden?: ProductFilters["sort"];
}>;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [brands, categories, products, t] = await Promise.all([
    getBrands(),
    getCategories(sp.marca),
    getProducts({
      brandSlug: sp.marca,
      categorySlug: sp.categoria,
      q: sp.q,
      sort: sp.orden,
    }),
    getT(),
  ]);

  const makeHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = {
      marca: sp.marca,
      categoria: sp.categoria,
      q: sp.q,
      orden: sp.orden,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return `/productos${qs ? `?${qs}` : ""}`;
  };

  const activeSort = sp.orden ?? "newest";
  const brandName = brands.find((b) => b.slug === sp.marca)?.name;
  const categoryName = categories.find((c) => c.slug === sp.categoria)?.name;
  const hasFilters = Boolean(sp.marca || sp.categoria || sp.q);

  return (
    <div className="container-page py-12 md:py-16">
      <header className="mb-8">
        <p className="kicker text-accent">{t("shop.kicker")}</p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl">{t("shop.title")}</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[248px_1fr] lg:gap-12">
        {/* ── Sidebar de filtros ─────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* En móvil se pliega con <details> nativo (sin JS). En desktop
              el contenido se fuerza visible vía CSS (.filters-panel). */}
          <details className="filters-panel group/f">
            <summary className="flex cursor-pointer list-none items-center justify-between border-b border-border pb-4 lg:cursor-default">
              <span className="font-heading text-lg">Filtros</span>
              {hasFilters && (
                <Link
                  href="/productos"
                  className="text-xs text-accent underline-offset-4 hover:underline"
                >
                  Limpiar todo
                </Link>
              )}
            </summary>

            <div className="space-y-9 pt-7">
              <form action="/productos" className="relative">
                {sp.marca && (
                  <input type="hidden" name="marca" value={sp.marca} />
                )}
                {sp.categoria && (
                  <input type="hidden" name="categoria" value={sp.categoria} />
                )}
                {sp.orden && (
                  <input type="hidden" name="orden" value={sp.orden} />
                )}
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.5}
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={sp.q}
                  placeholder="Buscar…"
                  className="h-11 w-full rounded-lg border border-fg/15 bg-card pl-10 pr-4 text-sm transition-colors placeholder:text-muted hover:border-fg/25 focus-visible:border-primary focus-visible:outline-none"
                />
              </form>

              <FilterGroup title="Marca">
                <FilterOption
                  href={makeHref({ marca: undefined, categoria: undefined })}
                  active={!sp.marca}
                  label="Todas las marcas"
                />
                {brands.map((b) => (
                  <FilterOption
                    key={b.slug}
                    href={makeHref({ marca: b.slug, categoria: undefined })}
                    active={sp.marca === b.slug}
                    label={b.name}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Categoría">
                <FilterOption
                  href={makeHref({ categoria: undefined })}
                  active={!sp.categoria}
                  label="Todas"
                />
                {categories.map((c) => (
                  <FilterOption
                    key={c.slug}
                    href={makeHref({ categoria: c.slug })}
                    active={sp.categoria === c.slug}
                    label={c.name}
                  />
                ))}
              </FilterGroup>
            </div>
          </details>
        </aside>

        {/* ── Grilla de productos ────────────────────────────── */}
        <div>
          {/* Barra superior: chips activos + orden */}
          <div className="mb-8 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {brandName && (
                <ActiveChip
                  label={brandName}
                  href={makeHref({ marca: undefined, categoria: undefined })}
                />
              )}
              {categoryName && (
                <ActiveChip
                  label={categoryName}
                  href={makeHref({ categoria: undefined })}
                />
              )}
              {sp.q && (
                <ActiveChip
                  label={`“${sp.q}”`}
                  href={makeHref({ q: undefined })}
                />
              )}
              {!hasFilters && (
                <span className="text-sm text-muted">Todo el catálogo</span>
              )}
            </div>

            <ProductSort current={activeSort} />
          </div>

          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-muted">
                No encontramos productos con esos filtros.
              </p>
              <Link
                href="/productos"
                className="mt-4 inline-block text-sm text-accent hover:underline"
              >
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.06} y={18}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Presentational helpers ─────────────────────────────────── */

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="kicker mb-2 text-muted">{title}</h2>
      <div className="-mx-2 flex flex-col">{children}</div>
    </div>
  );
}

function FilterOption({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/opt flex items-center gap-2.5 rounded-brand px-2 py-2 text-sm transition-colors",
        active ? "font-medium text-primary" : "text-muted hover:text-fg",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-all duration-300",
          active
            ? "bg-primary"
            : "bg-transparent group-hover/opt:bg-fg/30",
        )}
      />
      {label}
    </Link>
  );
}

function ActiveChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-fg transition-colors hover:border-fg/40"
    >
      {label}
      <span className="text-muted transition-colors group-hover:text-fg">✕</span>
    </Link>
  );
}
