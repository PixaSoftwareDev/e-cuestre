import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrandBySlug, getBrands, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { BrandThemeProvider } from "@/components/site/brand-theme-provider";
import { BrandHero } from "@/components/site/brand-hero";
import { Reveal } from "@/components/site/reveal";
import type { BrandTheme } from "@/lib/theme";

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((b) => ({ brand: b.slug }));
}

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
  const products = await getProducts({ brandSlug: b.slug });

  return (
    <BrandThemeProvider theme={b.theme as BrandTheme | null} className="bg-bg">
      {/* Hero de marca */}
      <BrandHero
        imageUrl={b.heroImageUrl}
        name={b.name}
        tagline={b.tagline}
      />

      {b.description && (
        <section className="container-page py-16 md:py-20">
          <Reveal>
            <p className="mx-auto max-w-2xl text-center font-heading text-xl leading-relaxed text-fg/80 md:text-2xl">
              {b.description}
            </p>
          </Reveal>
        </section>
      )}

      <section className="container-page pb-24">
        {products.length === 0 ? (
          <p className="py-16 text-center text-muted">
            Pronto sumaremos productos de esta marca.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06} y={18}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </BrandThemeProvider>
  );
}
