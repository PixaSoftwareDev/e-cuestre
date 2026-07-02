"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { useFly } from "@/store/fly";
import { track } from "@/lib/track";

export type QuickAddVariant = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
};

export type QuickAddData = {
  productId: string;
  slug: string;
  name: string;
  brandId: string;
  currency: string;
  imageUrl?: string;
  basePrice: number;
  variants: QuickAddVariant[];
};

/**
 * Acción rápida sobre la tarjeta de producto (aparece al hover).
 * - Si el producto tiene una sola opción real: agrega directo al carrito.
 * - Si tiene varias (talles/colores): lleva a la ficha para elegir.
 */
export function QuickAdd({ product }: { product: QuickAddData }) {
  const add = useCart((s) => s.add);
  const pushToast = useToast((s) => s.push);
  const fly = useFly((s) => s.trigger);
  const [added, setAdded] = useState(false);

  const inStock = product.variants.filter((v) => v.stock > 0);
  const hasStock = inStock.length > 0;
  const multiple =
    product.variants.length > 1 ||
    (product.variants[0]?.name && product.variants[0].name !== "Único");

  if (!hasStock) return null;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const variant = inStock[0];
    if (!variant) return;
    const price = variant.price ?? product.basePrice;
    if (product.imageUrl) {
      fly(product.imageUrl, (e.currentTarget as HTMLElement).getBoundingClientRect());
    }
    add({
      productId: product.productId,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      variantName: variant.name,
      imageUrl: product.imageUrl,
      unitPrice: price,
      currency: product.currency,
      maxStock: variant.stock,
    });
    track({
      type: "add_to_cart",
      productId: product.productId,
      brandId: product.brandId,
      value: price,
      quantity: 1,
      metadata: { variant: variant.name, source: "quick-add" },
    });
    pushToast(`${product.name} agregado`, { cart: true });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const base =
    "flex h-11 w-full items-center justify-center gap-2 rounded-brand bg-bg/90 px-4 text-sm font-medium text-fg shadow-[var(--shadow-soft)] backdrop-blur-md transition-colors hover:bg-bg";

  if (multiple) {
    return (
      <Link href={`/producto/${product.slug}`} className={base}>
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
        Elegir opciones
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleAdd} className={base}>
      {added ? (
        <>
          <Check className="h-4 w-4" /> Agregado
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Agregar al carrito
        </>
      )}
    </button>
  );
}
