import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Leaf, Recycle, Tag } from "lucide-react";
import {
  getBrands,
  getOffers,
  getCategoriesForHome,
  getFeaturedProducts,
  productFromPrice,
} from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { SiteHero } from "@/components/site/site-hero";
import { RecentlyViewed } from "@/components/site/recently-viewed";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export default async function HomePage() {
  const [brands, offers, categories, featured, t] = await Promise.all([
    getBrands(),
    getOffers(8),
    getCategoriesForHome(6),
    getFeaturedProducts(8),
    getT(),
  ]);

  const brandsWithLogo = brands.filter((b) => b.logoUrl);
  // Foto editorial de orígenes/oficio (talabartería a mano). Fija, no de una marca.
  const aboutImage =
    "https://images.unsplash.com/photo-1647502191516-68a4f8c74ed4?w=1200&q=80&auto=format&fit=crop";

  // Compromisos de la casa (sustentabilidad + garantía).
  const commitments = [
    {
      icon: Leaf,
      title: "Cuero teñido vegetal",
      text: "La mayoría de nuestras piezas de cuero se curten con tintes naturales, para el menor impacto posible en el medio ambiente.",
    },
    {
      icon: Recycle,
      title: "Comprometidos con la sustentabilidad",
      text: "Cuidamos el ambiente en cada proceso: selección de materiales e insumos, empaque de los envíos y reciclado de embalajes y descartables.",
    },
    {
      icon: ShieldCheck,
      title: "Garantía en todos los productos",
      text: "Que estés conforme es nuestra prioridad. Por eso, para tu tranquilidad, todas las piezas tienen garantía.",
    },
  ];

  // Descuento máximo entre las ofertas (para el sello "Hasta −X%").
  const maxDiscount = offers.reduce((max, p) => {
    const price = productFromPrice(p);
    const d =
      p.compareAtPrice && p.compareAtPrice > price
        ? Math.round((1 - price / p.compareAtPrice) * 100)
        : 0;
    return Math.max(max, d);
  }, 0);

  const values = [
    { t: t("home.values.materials.title"), d: t("home.values.materials.desc") },
    { t: t("home.values.lasting.title"), d: t("home.values.lasting.desc") },
    { t: t("home.values.secure.title"), d: t("home.values.secure.desc") },
  ];

  return (
    <div>
      {/* ── HERO: la casa (Ecuestre) — video de caballos ── */}
      <SiteHero
        imageUrl="https://res.cloudinary.com/dukv3ov6t/image/upload/v1783296082/hawsrvxet7sy8odgi74m.jpg"
        videoUrl="https://res.cloudinary.com/dukv3ov6t/video/upload/v1783336741/ygy6ap8ahh04wrjonljr.mp4"
      />

      {/* ── RUBROS: explorá por categoría ─────────────────── */}
      {categories.length > 0 && (
        <section className="container-page py-20 md:py-28">
          <Reveal>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="kicker text-accent">Explorá</p>
                <h2 className="mt-2 font-heading text-3xl md:text-4xl">
                  Comprá por rubro
                </h2>
              </div>
              <Link
                href="/productos"
                className="hidden items-center gap-1.5 text-sm transition-colors hover:text-primary md:inline-flex"
              >
                Ver la tienda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 6) * 0.05}>
                <Link
                  href={`/productos?categoria=${c.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-brand"
                >
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-smooth)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-center text-sm font-medium text-white">
                    {c.name}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── OFERTAS: promocional (manejable desde el admin) ─── */}
      {offers.length > 0 && (
        <section className="bg-card py-20 md:py-28">
          <div className="container-page">
            <Reveal>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="kicker text-[#c0392b]">
                      {t("home.offers.kicker")}
                    </p>
                    {maxDiscount > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c0392b] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(192,57,43,0.35)]">
                        <Tag className="h-3 w-3" strokeWidth={2.5} />
                        {t("home.offers.upTo")} −{maxDiscount}%
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 font-heading text-3xl md:text-4xl">
                    {t("home.offers.title")}
                  </h2>
                </div>
                <Link
                  href="/productos"
                  className="hidden items-center gap-1.5 text-sm transition-colors hover:text-primary md:inline-flex"
                >
                  {t("home.offers.viewShop")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {offers.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 0.06} y={18}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

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

          {/* Las 3 marcas en fila, con el logo sobre la foto */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {brands.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.1}>
                <Link
                  href={`/marca/${b.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-brand"
                >
                  {b.heroImageUrl ? (
                    <Image
                      src={b.heroImageUrl}
                      alt={b.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-[center_25%] transition-transform duration-700 ease-[var(--ease-smooth)] group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-primary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/55 transition-opacity duration-500 group-hover:opacity-75" />

                  {/* Logo centrado */}
                  <div className="absolute inset-x-0 top-0 flex h-[62%] items-center justify-center p-6">
                    {b.logoUrl ? (
                      <Image
                        src={b.logoUrl}
                        alt={b.name}
                        width={240}
                        height={96}
                        className="h-16 w-auto brightness-0 invert drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-105 md:h-20"
                      />
                    ) : (
                      <h3 className="font-heading text-3xl text-white">
                        {b.name}
                      </h3>
                    )}
                  </div>

                  {/* Tagline + CTA abajo */}
                  <div className="absolute inset-x-0 bottom-0 p-6 text-center text-white">
                    {b.tagline && (
                      <p className="text-sm leading-snug text-white/85">
                        {b.tagline}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-white/90 transition-all group-hover:gap-2.5">
                      {t("home.brands.discover")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── DESTACADOS: vidriera de producto ─────────────── */}
      {featured.length > 0 && (
        <section className="bg-card py-20 md:py-28">
          <div className="container-page">
            <Reveal>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <p className="kicker text-accent">Selección</p>
                  <h2 className="mt-2 font-heading text-3xl md:text-4xl">
                    Destacados de la temporada
                  </h2>
                </div>
                <Link
                  href="/productos"
                  className="hidden items-center gap-1.5 text-sm transition-colors hover:text-primary md:inline-flex"
                >
                  Ver todo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {featured.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 0.06} y={18}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SOMOS ECUESTRE: identidad / nosotros ─────────── */}
      <section className="container-page py-20 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-brand">
              <Image
                src={aboutImage}
                alt="Ecuestre"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="kicker text-accent">Nuestra historia</p>
            <h2 className="mt-3 font-heading text-3xl leading-tight md:text-4xl">
              Nacimos del oficio
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Ecuestre empezó entre el olor a cuero y el silencio del campo, de
              la mano de talabarteros que trabajan cada pieza como hace
              generaciones. De esa raíz nació esta casa: reunir a las mejores
              firmas del mundo ecuestre en un mismo lugar, sin perder nunca el
              respeto por el oficio ni por quien lo lleva puesto.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/productos">
                Conocer la tienda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── COMPROMISOS: sustentabilidad + garantía ─────── */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="kicker text-accent">Nuestro compromiso</p>
            <h2 className="mt-2 font-heading text-3xl md:text-4xl">
              Hecho con conciencia
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-5xl gap-12 md:grid-cols-3">
          {commitments.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <div className="text-center">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 text-accent">
                  <c.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 font-heading text-lg">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {c.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SEGUÍ EXPLORANDO (personalizado) ─────────────── */}
      <RecentlyViewed title={t("home.keepExploring")} />

      {/* ── VALORES: por qué Ecuestre (editorial) ────────── */}
      <section className="border-y border-border bg-card">
        <div className="container-page grid gap-12 py-16 md:grid-cols-3 md:gap-0 md:py-20">
          {values.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.1}>
              <div
                className={`h-full ${
                  i > 0 ? "md:border-l md:border-border md:pl-12" : "md:pr-12"
                }`}
              >
                <span className="font-heading text-6xl leading-none text-accent/30">
                  0{i + 1}
                </span>
                <h3 className="mt-7 font-heading text-xl">{v.t}</h3>
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
