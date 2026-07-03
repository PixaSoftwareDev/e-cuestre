import Link from "next/link";
import Image from "next/image";
import {
  type ProductFull,
  productFromPrice,
  productStock,
} from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { QuickAdd } from "@/components/site/quick-add";
import { FavoriteButton } from "@/components/site/favorite-button";

export function ProductCard({ product }: { product: ProductFull }) {
  const price = productFromPrice(product);
  const stock = productStock(product);
  const img = product.images[0];
  const hoverImg = product.images[1];
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > price;
  const discountPct = hasDiscount
    ? Math.round((1 - price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-brand bg-fg/5 hover-lift">
        {img && (
          <Image
            src={img.url}
            alt={img.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ viewTransitionName: `product-${product.slug}` }}
            className="object-cover transition-transform duration-[900ms] ease-[var(--ease-smooth)] group-hover:scale-[1.06]"
          />
        )}
        {hoverImg && (
          <Image
            src={hoverImg.url}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-smooth)] group-hover:opacity-100"
          />
        )}

        {/* Velo inferior sutil para que el quick-add tenga contraste */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {hasDiscount && (
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
              −{discountPct}%
            </span>
          )}
          {stock === 0 && (
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-md">
              Agotado
            </span>
          )}
        </div>

        {/* Favorito: oculto, aparece al hover de la tarjeta (o si ya es favorito) */}
        <FavoriteButton
          variant="card"
          className="absolute right-2 top-2 z-10"
          item={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            brandName: product.brand.name,
            imageUrl: img?.url,
            price,
            currency: product.currency,
          }}
        />

        {/* Quick-add: aparece deslizándose desde abajo al hover (desktop) */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 translate-y-3 opacity-0 transition-all duration-500 ease-[var(--ease-smooth)] group-hover:translate-y-0 group-hover:opacity-100">
          <QuickAdd
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              brandId: product.brandId,
              currency: product.currency,
              imageUrl: img?.url,
              basePrice: product.basePrice,
              variants: product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price,
                stock: v.stock,
              })),
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p className="kicker text-muted">{product.brand.name}</p>
        <h3 className="font-heading text-base leading-snug transition-colors group-hover:text-primary">
          <span className="bg-gradient-to-r from-primary to-primary bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-px transition-[background-size] duration-500 ease-[var(--ease-smooth)] group-hover:bg-[length:100%_1px]">
            {product.name}
          </span>
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm tabular-nums">
            {formatMoney(price, product.currency)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through tabular-nums">
              {formatMoney(product.compareAtPrice!, product.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Enlace que cubre toda la tarjeta salvo la zona del quick-add (z-10) */}
      <Link
        href={`/producto/${product.slug}`}
        className="absolute inset-0 z-0 rounded-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        aria-label={product.name}
      />
    </article>
  );
}
