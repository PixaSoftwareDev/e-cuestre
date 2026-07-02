"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { useFly } from "@/store/fly";
import { track } from "@/lib/track";
import { formatMoney } from "@/lib/money";

export type AddToCartVariant = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type AddToCartProduct = {
  productId: string;
  slug: string;
  name: string;
  brandId: string;
  currency: string;
  imageUrl?: string;
  variants: AddToCartVariant[];
};

export function AddToCart({ product }: { product: AddToCartProduct }) {
  const add = useCart((s) => s.add);
  const pushToast = useToast((s) => s.push);
  const fly = useFly((s) => s.trigger);
  const [variantId, setVariantId] = useState(
    product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0]?.id,
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId),
    [product.variants, variantId],
  );
  const stock = variant?.stock ?? 0;
  const price = variant?.price ?? 0;

  function handleAdd(e: React.MouseEvent) {
    if (!variant || stock <= 0) return;
    if (product.imageUrl) {
      fly(product.imageUrl, (e.currentTarget as HTMLElement).getBoundingClientRect());
    }
    add(
      {
        productId: product.productId,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        variantName: variant.name,
        imageUrl: product.imageUrl,
        unitPrice: price,
        currency: product.currency,
        maxStock: stock,
      },
      qty,
    );
    track({
      type: "add_to_cart",
      productId: product.productId,
      brandId: product.brandId,
      value: price * qty,
      quantity: qty,
      metadata: { variant: variant.name },
    });
    pushToast(`${product.name} agregado`, { cart: true });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const multipleVariants =
    product.variants.length > 1 ||
    (product.variants[0]?.name && product.variants[0].name !== "Único");

  return (
    <div className="space-y-6">
      {multipleVariants && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="kicker text-muted">Opción</p>
            {variant && (
              <span className="text-xs text-muted">{variant.name}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const disabled = v.stock <= 0;
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  disabled={disabled}
                  onClick={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className={cn(
                    "relative rounded-brand border px-4 py-2 text-sm transition-colors duration-300",
                    active
                      ? "border-primary text-primary-fg"
                      : "border-border hover:border-fg/40",
                    disabled && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="variant-active"
                      className="absolute inset-0 -z-0 rounded-brand bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{v.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-brand border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center hover:bg-fg/5"
            aria-label="Restar"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            className="flex h-11 w-11 items-center justify-center hover:bg-fg/5"
            aria-label="Sumar"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-muted">
          {stock > 0 ? `${stock} disponibles` : "Sin stock"}
        </span>
      </div>

      <Button
        size="lg"
        className="w-full overflow-hidden"
        disabled={stock <= 0}
        onClick={handleAdd}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2"
            >
              <Check className="h-5 w-5" /> Agregado al carrito
            </motion.span>
          ) : stock <= 0 ? (
            <motion.span key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Agotado
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              Agregar — {formatMoney(price * qty, product.currency)}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
