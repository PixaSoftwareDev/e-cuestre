import Link from "next/link";
import Image from "next/image";
import {
  type ProductFull,
  productFromPrice,
  productStock,
} from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: ProductFull }) {
  const price = productFromPrice(product);
  const stock = productStock(product);
  const img = product.images[0];
  const hoverImg = product.images[1];
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > price;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-brand bg-fg/5">
        {img && (
          <Image
            src={img.url}
            alt={img.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-all duration-700 ease-[var(--ease-smooth)] group-hover:scale-105"
          />
        )}
        {hoverImg && (
          <Image
            src={hoverImg.url}
            alt={hoverImg.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && <Badge variant="accent">Oferta</Badge>}
          {stock === 0 && <Badge variant="muted">Agotado</Badge>}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <p className="kicker text-muted">{product.brand.name}</p>
        <h3 className="font-heading text-base leading-snug group-hover:text-primary transition-colors">
          {product.name}
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
    </Link>
  );
}
