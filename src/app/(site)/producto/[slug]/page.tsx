import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getActiveProductSlugs,
  getProducts,
  productFromPrice,
} from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductViewTracker } from "@/components/site/product-view-tracker";
import { AddToCart } from "@/components/cart/add-to-cart";
import { BrandThemeProvider } from "@/components/site/brand-theme-provider";
import { ProductCard } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import type { BrandTheme } from "@/lib/theme";

export async function generateStaticParams() {
  const slugs = await getActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description ?? undefined,
    openGraph: {
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const price = productFromPrice(product);
  const related = (
    await getProducts({ brandSlug: product.brand.slug })
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <BrandThemeProvider theme={product.brand.theme as BrandTheme | null}>
      <ProductViewTracker
        productId={product.id}
        brandId={product.brandId}
        price={price}
      />
      <div className="container-page py-10 md:py-16">
        <nav className="mb-8 text-sm text-muted">
          <Link href="/productos" className="hover:text-primary">
            Tienda
          </Link>{" "}
          / <span className="text-fg">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          <div className="md:sticky md:top-28 md:self-start">
            <Link
              href={`/marca/${product.brand.slug}`}
              className="kicker text-accent hover:underline"
            >
              {product.brand.name}
            </Link>
            <h1 className="mt-2 font-heading text-3xl md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl tabular-nums">
                {formatMoney(price, product.currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > price && (
                <>
                  <span className="text-muted line-through tabular-nums">
                    {formatMoney(product.compareAtPrice, product.currency)}
                  </span>
                  <Badge variant="accent">Oferta</Badge>
                </>
              )}
            </div>

            {product.description && (
              <p className="mt-6 text-fg/80">{product.description}</p>
            )}

            <div className="mt-8">
              <AddToCart
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  brandId: product.brandId,
                  currency: product.currency,
                  imageUrl: product.images[0]?.url,
                  variants: product.variants.map((v) => ({
                    id: v.id,
                    name: v.name,
                    price: v.price ?? product.basePrice,
                    stock: v.stock,
                  })),
                }}
              />
            </div>

            {(product.material || product.story) && (
              <div className="mt-10 space-y-4 border-t border-border pt-8">
                {product.material && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Material</span>
                    <span>{product.material}</span>
                  </div>
                )}
                {product.story && (
                  <p className="text-sm leading-relaxed text-fg/70">
                    {product.story}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-8 font-heading text-2xl md:text-3xl">
              También de {product.brand.name}
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </BrandThemeProvider>
  );
}
