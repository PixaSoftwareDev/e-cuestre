"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductGallery } from "@/components/site/product-gallery";
import { FavoriteButton } from "@/components/site/favorite-button";
import { PaymentMethods } from "@/components/site/payment-methods";
import { AddToCart } from "@/components/cart/add-to-cart";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

type ColorVariant = { id: string; name: string; price: number | null; stock: number };
type Img = { url: string; alt: string | null };
export type ProductColorData = {
  id: string;
  name: string;
  hex: string;
  images: Img[];
  variants: ColorVariant[];
};

export type ColorProductProps = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  currency: string;
  basePrice: number;
  compareAtPrice: number | null;
  description: string | null;
  colors: ProductColorData[];
};

function fromPrice(variants: ColorVariant[], basePrice: number) {
  const prices = variants.map((v) => v.price ?? basePrice).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : basePrice;
}

export function ColorProduct(p: ColorProductProps) {
  const t = useT();
  const [colorId, setColorId] = useState(p.colors[0]?.id);
  const color = p.colors.find((c) => c.id === colorId) ?? p.colors[0];

  const price = fromPrice(color.variants, p.basePrice);
  const hasDiscount = p.compareAtPrice && p.compareAtPrice > price;
  const discountPct = hasDiscount
    ? Math.round((1 - price / p.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      {/* Galería del color activo (se re-monta al cambiar color) */}
      <ProductGallery
        key={color.id}
        images={color.images}
        name={`${p.name} ${color.name}`}
        slug={p.slug}
      />

      <div className="md:sticky md:top-28 md:self-start">
        <Link
          href={`/marca/${p.brandSlug}`}
          className="kicker text-accent hover:underline"
        >
          {p.brandName}
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-heading text-3xl md:text-4xl">{p.name}</h1>
          <FavoriteButton
            className="mt-1 shrink-0"
            item={{
              id: p.id,
              slug: p.slug,
              name: p.name,
              brandName: p.brandName,
              imageUrl: color.images[0]?.url,
              price,
              currency: p.currency,
            }}
          />
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl tabular-nums">
            {formatMoney(price, p.currency)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-muted line-through tabular-nums">
                {formatMoney(p.compareAtPrice!, p.currency)}
              </span>
              <Badge variant="accent">−{discountPct}%</Badge>
            </>
          )}
        </div>

        {p.description && <p className="mt-6 text-fg/80">{p.description}</p>}

        {/* Selector de color (swatches) */}
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="kicker text-muted">Color</p>
            <span className="text-xs text-muted">{color.name}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {p.colors.map((c) => {
              const active = c.id === color.id;
              const soldOut = c.variants.every((v) => v.stock <= 0);
              return (
                <button
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  aria-label={c.name}
                  aria-pressed={active}
                  title={c.name + (soldOut ? " (agotado)" : "")}
                  className={cn(
                    "relative h-9 w-9 rounded-full ring-1 ring-black/10 transition-transform dark:ring-white/15",
                    active
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-bg"
                      : "hover:scale-110",
                    soldOut && "opacity-40",
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </div>

        {/* Talles del color activo (se re-monta al cambiar color) */}
        <div className="mt-8">
          <AddToCart
            key={color.id}
            product={{
              productId: p.id,
              slug: p.slug,
              name: `${p.name} · ${color.name}`,
              brandId: p.brandId,
              currency: p.currency,
              imageUrl: color.images[0]?.url,
              variants: color.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price ?? p.basePrice,
                stock: v.stock,
              })),
            }}
          />
        </div>

        <div className="mt-5 flex items-center gap-3 text-xs text-muted">
          <span>{t("product.payWith")}</span>
          <PaymentMethods size={24} />
        </div>
      </div>
    </div>
  );
}
