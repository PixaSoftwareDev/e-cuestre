import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getBrandBySlug, getBrands, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/product-card";
import { BrandThemeProvider } from "@/components/site/brand-theme-provider";
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
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        {b.heroImageUrl ? (
          <Image
            src={b.heroImageUrl}
            alt={b.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-page relative z-10 pb-16 text-white">
          <h1 className="font-heading text-4xl md:text-6xl">{b.name}</h1>
          {b.tagline && (
            <p className="mt-3 max-w-xl text-lg text-white/85">{b.tagline}</p>
          )}
        </div>
      </section>

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
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </BrandThemeProvider>
  );
}
