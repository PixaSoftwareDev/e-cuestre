import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getBrandBySlug, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { BrandThemeProvider } from "@/components/site/brand-theme-provider";
import { BrandHero } from "@/components/site/brand-hero";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import type { BrandTheme } from "@/lib/theme";

// Render dinámico: evita que Next pre-genere estas páginas al arrancar (si la
// DB tarda en el cold-start, cacheaba un 404). Rinde fresco en cada request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b) return {};
  return { title: b.name, description: b.description ?? b.tagline ?? undefined };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b || !b.active) notFound();

  const all = await getProducts({ brandSlug: b.slug });
  const selection = all.slice(0, 6);
  const shopHref = `/productos?marca=${b.slug}`;

  return (
    <BrandThemeProvider theme={b.theme as BrandTheme | null} className="bg-bg">
      {/* ── HERO ──────────────────────────────────────────── */}
      <BrandHero
        imageUrl={b.heroImageUrl}
        logoUrl={b.logoUrl}
        name={b.name}
        tagline={b.tagline}
      />

      {/* ── RELATO: quién es la marca ─────────────────────── */}
      <section className="container-page py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="kicker text-accent">La casa</p>
          </Reveal>
          {b.tagline && (
            <Reveal delay={0.06}>
              <p className="mx-auto mt-6 max-w-2xl font-heading text-2xl leading-[1.25] md:text-4xl">
                {b.tagline}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.12}>
            <span className="mx-auto mt-8 block h-px w-16 bg-accent" />
          </Reveal>
          {b.description && (
            <Reveal delay={0.18}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-fg/70 md:text-lg">
                {b.description}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── SELECCIÓN: piezas destacadas (no todo el catálogo) ─ */}
      {selection.length > 0 && (
        <section className="container-page">
          <Reveal>
            <div className="flex items-end justify-between border-t border-border pt-14">
              <div>
                <p className="kicker text-accent">Selección</p>
                <h2 className="mt-2 font-heading text-3xl md:text-4xl">
                  Piezas destacadas
                </h2>
              </div>
              <Link
                href={shopHref}
                className="hidden items-center gap-1.5 text-sm transition-colors hover:text-primary md:inline-flex"
              >
                Ver toda la colección
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
            {selection.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.07} y={20}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA a la tienda (con la foto de la marca) ─────── */}
      <section className="container-page py-24 md:py-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-brand">
            {b.heroImageUrl ? (
              <Image
                src={b.heroImageUrl}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-cover object-[center_30%]"
              />
            ) : (
              <div className="absolute inset-0 bg-[#16281d]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
            <div className="relative px-6 py-20 text-center text-white md:py-28">
              <p className="kicker text-white/60">La colección completa</p>
              <h2 className="mx-auto mt-4 max-w-2xl font-heading text-3xl md:text-5xl">
                Descubrí todas las piezas de {b.name}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-white/75">
                {all.length} piezas disponibles, con precios y stock en la
                tienda.
              </p>
              <div className="mt-9">
                <Button asChild size="lg" variant="accent">
                  <Link href={shopHref}>
                    Ir a la tienda
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </BrandThemeProvider>
  );
}
