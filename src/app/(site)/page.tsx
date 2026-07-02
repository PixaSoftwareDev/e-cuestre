import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getBrands, getFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { SiteHero } from "@/components/site/site-hero";
import { RecentlyViewed } from "@/components/site/recently-viewed";
import { getT } from "@/lib/i18n/server";

export default async function HomePage() {
  const [brands, featured, t] = await Promise.all([
    getBrands(),
    getFeaturedProducts(8),
    getT(),
  ]);

  const hero = brands.find((b) => b.heroImageUrl) ?? brands[0];

  const values = [
    { t: t("home.values.materials.title"), d: t("home.values.materials.desc") },
    { t: t("home.values.lasting.title"), d: t("home.values.lasting.desc") },
    { t: t("home.values.secure.title"), d: t("home.values.secure.desc") },
  ];

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <SiteHero
        imageUrl={hero?.heroImageUrl}
        brandSlug={hero?.slug}
        brandName={hero?.name}
      />

      {/* ── DESTACADOS ───────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="container-page py-20 md:py-28">
          <Reveal>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="kicker text-accent">{t("home.featured.kicker")}</p>
                <h2 className="mt-2 font-heading text-3xl md:text-4xl">
                  {t("home.featured.title")}
                </h2>
              </div>
              <Link
                href="/productos"
                className="hidden items-center gap-1 text-sm hover:text-primary md:inline-flex"
              >
                {t("home.viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── MARCAS ───────────────────────────────────────── */}
      {brands.length > 0 && (
        <section className="bg-card py-20 md:py-28">
          <div className="container-page">
            <Reveal>
              <p className="kicker text-accent">{t("home.brands.kicker")}</p>
              <h2 className="mt-2 max-w-2xl font-heading text-3xl md:text-4xl">
                {t("home.brands.title")}
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                {t("home.brands.subtitle")}
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {brands.map((b, i) => (
                <Reveal key={b.id} delay={i * 0.08}>
                  <Link
                    href={`/marca/${b.slug}`}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-brand"
                  >
                    {b.heroImageUrl ? (
                      <Image
                        src={b.heroImageUrl}
                        alt={b.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-smooth)] group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-primary" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3 className="font-heading text-2xl">{b.name}</h3>
                      {b.tagline && (
                        <p className="mt-1 text-sm text-white/80">{b.tagline}</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SEGUÍ EXPLORANDO (personalizado) ─────────────── */}
      <RecentlyViewed title={t("home.keepExploring")} />

      {/* ── VALORES ──────────────────────────────────────── */}
      <section className="container-page grid gap-10 py-20 md:grid-cols-3 md:py-28">
        {values.map((v, i) => (
          <Reveal key={v.t} delay={i * 0.08}>
            <div>
              <div className="mb-4 h-px w-12 bg-accent" />
              <h3 className="font-heading text-xl">{v.t}</h3>
              <p className="mt-2 text-sm text-muted">{v.d}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
