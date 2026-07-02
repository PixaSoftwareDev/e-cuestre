import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getActiveProductSlugs,
  getProducts,
  productFromPrice,
  productStock,
} from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductViewTracker } from "@/components/site/product-view-tracker";
import { RecentTracker } from "@/components/site/recent-tracker";
import { RecentlyViewed } from "@/components/site/recently-viewed";
import { AddToCart } from "@/components/cart/add-to-cart";
import { NotifyStock } from "@/components/site/notify-stock";
import { BrandThemeProvider } from "@/components/site/brand-theme-provider";
import { ProductCard } from "@/components/site/product-card";
import { FavoriteButton } from "@/components/site/favorite-button";
import { PaymentMethods } from "@/components/site/payment-methods";
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
  const soldOut = productStock(product) === 0;
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
      <RecentTracker
        item={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          brandName: product.brand.name,
          imageUrl: product.images[0]?.url,
          price,
          currency: product.currency,
        }}
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
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="font-heading text-3xl md:text-4xl">
                {product.name}
              </h1>
              <FavoriteButton
                className="mt-1 shrink-0"
                item={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  brandName: product.brand.name,
                  imageUrl: product.images[0]?.url,
                  price,
                  currency: product.currency,
                }}
              />
            </div>

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

            <div className="mt-8 space-y-4">
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
              {soldOut && (
                <NotifyStock productId={product.id} productName={product.name} />
              )}
            </div>

            {/* Medios de pago a mano */}
            <div className="mt-5 flex items-center gap-3 text-xs text-muted">
              <span>Pagá con</span>
              <PaymentMethods size={24} />
            </div>
          </div>
        </div>

        {/* ── Descripción y características ─────────────────────── */}
        <section className="mt-16 grid gap-10 border-t border-border pt-12 md:mt-20 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="kicker mb-4 text-accent">Descripción</h2>
            {product.description && (
              <p className="leading-relaxed text-fg/80">{product.description}</p>
            )}
            {product.story && (
              <p className="mt-4 leading-relaxed text-fg/70">{product.story}</p>
            )}
            {!product.description && !product.story && (
              <p className="text-muted">Sin descripción disponible.</p>
            )}
          </div>

          <div>
            <h2 className="kicker mb-4 text-accent">Características</h2>
            <dl className="divide-y divide-border text-sm">
              {product.material && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">Material</dt>
                  <dd className="text-right">{product.material}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Marca</dt>
                <dd className="text-right">{product.brand.name}</dd>
              </div>
              {product.category && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">Categoría</dt>
                  <dd className="text-right">{product.category.name}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Opciones</dt>
                <dd className="text-right">
                  {product.variants.map((v) => v.name).join(" · ")}
                </dd>
              </div>
            </dl>

            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

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

      <RecentlyViewed excludeId={product.id} />
    </BrandThemeProvider>
  );
}
