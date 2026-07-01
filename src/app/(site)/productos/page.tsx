import Link from "next/link";
import type { Metadata } from "next";
import {
  getBrands,
  getCategories,
  getProducts,
  type ProductFilters,
} from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tienda" };

type SearchParams = Promise<{
  marca?: string;
  categoria?: string;
  q?: string;
  orden?: ProductFilters["sort"];
}>;

const SORTS: { value: NonNullable<ProductFilters["sort"]>; label: string }[] = [
  { value: "newest", label: "Novedades" },
  { value: "price-asc", label: "Precio ↑" },
  { value: "price-desc", label: "Precio ↓" },
];

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [brands, categories, products] = await Promise.all([
    getBrands(),
    getCategories(sp.marca),
    getProducts({
      brandSlug: sp.marca,
      categorySlug: sp.categoria,
      q: sp.q,
      sort: sp.orden,
    }),
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
        <p className="kicker text-accent">Catálogo</p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl">La tienda</h1>
        <p className="mt-3 text-sm text-muted">
          {products.length}{" "}
          {products.length === 1 ? "producto" : "productos"}
          {brandName ? ` · ${brandName}` : ""}
          {categoryName ? ` · ${categoryName}` : ""}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* ── Sidebar de filtros ─────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* En móvil se pliega con <details> nativo (sin JS). */}
          <details className="group" open>
            <summary className="flex cursor-pointer list-none items-center justify-between border-b border-border pb-3 lg:cursor-default">
              <span className="kicker text-muted">Filtros</span>
              {hasFilters && (
                <Link
                  href="/productos"
                  className="text-xs text-accent hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </summary>

            <div className="space-y-8 pt-6">
              <FilterGroup title="Buscar">
                <form action="/productos" className="flex">
                  {sp.marca && (
                    <input type="hidden" name="marca" value={sp.marca} />
                  )}
                  {sp.categoria && (
                    <input type="hidden" name="categoria" value={sp.categoria} />
                  )}
                  {sp.orden && (
                    <input type="hidden" name="orden" value={sp.orden} />
                  )}
                  <input
                    type="search"
                    name="q"
                    defaultValue={sp.q}
                    placeholder="Buscar producto…"
                    className="h-10 w-full rounded-brand border border-border bg-card px-3 text-sm focus-visible:border-primary focus-visible:outline-none"
                  />
                </form>
              </FilterGroup>

              <FilterGroup title="Marca">
                <FilterOption
                  href={makeHref({ marca: undefined, categoria: undefined })}
                  active={!sp.marca}
                  label="Todas"
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

            <div className="flex items-center gap-1">
              {SORTS.map((s) => (
                <Link
                  key={s.value}
                  href={makeHref({ orden: s.value })}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs transition-colors",
                    activeSort === s.value
                      ? "bg-fg/5 text-fg"
                      : "text-muted hover:text-fg",
                  )}
                >
                  {s.label}
                </Link>
              ))}
            </div>
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
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
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
      <h2 className="kicker mb-3 text-fg">{title}</h2>
      <div className="flex flex-col gap-0.5">{children}</div>
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
        "flex items-center rounded-brand px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary text-primary-fg"
          : "text-muted hover:bg-fg/5 hover:text-fg",
      )}
    >
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
