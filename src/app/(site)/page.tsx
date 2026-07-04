import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gem, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";
import { getBrands, getFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { SiteHero } from "@/components/site/site-hero";
import { RecentlyViewed } from "@/components/site/recently-viewed";
import { getT } from "@/lib/i18n/server";

export default async function HomePage() {
  const [brands, featured, t] = await Promise.all([
    getBrands(),
    getFeaturedProducts(4),
    getT(),
  ]);

  const [lead, ...rest] = brands;
  const brandsWithLogo = brands.filter((b) => b.logoUrl);

  const values = [
    {
      icon: Gem,
      t: t("home.values.materials.title"),
      d: t("home.values.materials.desc"),
    },
    {
      icon: InfinityIcon,
      t: t("home.values.lasting.title"),
      d: t("home.values.lasting.desc"),
    },
    {
      icon: ShieldCheck,
      t: t("home.values.secure.title"),
      d: t("home.values.secure.desc"),
    },
  ];

  return (
    <div>
      {/* ── HERO: la casa (Ecuestre) — genérico, sin foto de marca ── */}
      <SiteHero />

      {/* ── MARCAS: protagonista ─────────────────────────── */}
      {brands.length > 0 && (
        <section className="container-page py-20 md:py-28">
          <Reveal>
            <p className="kicker text-accent">{t("home.brands.kicker")}</p>
            <h2 className="mt-2 max-w-2xl font-heading text-3xl md:text-4xl">
              {t("home.brands.title")}
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              {t("home.brands.subtitle")}
            </p>
          </Reveal>

          {/* Marca destacada (grande) */}
          {lead && (
            <Reveal>
              <Link
                href={`/marca/${lead.slug}`}
                className="group relative mt-10 block aspect-[4/5] overflow-hidden rounded-brand sm:aspect-[16/10] md:aspect-[16/9]"
              >
                {lead.heroImageUrl ? (
                  <Image
                    src={lead.heroImageUrl}
                    alt={lead.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1200px"
                    className="object-cover object-[center_25%] transition-transform duration-700 ease-[var(--ease-smooth)] group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white md:p-12">
                  <h3 className="font-heading text-3xl md:text-5xl">
                    {lead.name}
                  </h3>
                  {lead.tagline && (
                    <p className="mt-3 max-w-md text-white/85">{lead.tagline}</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                    {t("home.brands.discover")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Resto de las marcas */}
          {rest.length > 0 && (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {rest.map((b, i) => (
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
          )}
        </section>
      )}

      {/* ── UNA SELECCIÓN (productos, secundario) ─────────── */}
      {featured.length > 0 && (
        <section className="bg-card py-20 md:py-28">
          <div className="container-page">
            <Reveal>
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="kicker text-accent">
                    {t("home.featured.kicker")}
                  </p>
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
          </div>
        </section>
      )}

      {/* ── SEGUÍ EXPLORANDO (personalizado) ─────────────── */}
      <RecentlyViewed title={t("home.keepExploring")} />

      {/* ── VALORES: por qué Ecuestre ────────────────────── */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.08}>
              <div className="group h-full rounded-brand border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--shadow-lift)]">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-primary-fg">
                  <v.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-xl">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── STATEMENT DE FIRMAS (verde oscuro fijo en ambos modos) ── */}
      {brandsWithLogo.length > 0 && (
        <section className="relative overflow-hidden bg-[#16281d] text-[#f6f3ec]">
          {/* Textura sutil de luz para dar profundidad al fondo */}
          <div className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_center,rgba(176,141,87,0.14),transparent_70%)]" />
          <div className="container-page relative py-24 text-center md:py-36">
            <Reveal>
              <p className="kicker text-[#f6f3ec]/55">
                {t("home.brandStrip.title")}
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-heading text-3xl md:text-5xl">
                {t("home.brandStrip.heading")}
              </h2>
            </Reveal>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-20 gap-y-14 md:mt-20 md:gap-x-32">
              {brandsWithLogo.map((b, i) => (
                <Reveal key={b.id} delay={i * 0.1}>
                  <Link
                    href={`/marca/${b.slug}`}
                    aria-label={b.name}
                    className="group block"
                  >
                    <Image
                      src={b.logoUrl!}
                      alt={b.name}
                      width={340}
                      height={136}
                      className="h-28 w-auto opacity-90 brightness-0 invert transition-all duration-500 ease-[var(--ease-smooth)] group-hover:scale-105 group-hover:opacity-100 md:h-40"
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
