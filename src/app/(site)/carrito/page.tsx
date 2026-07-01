"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, setQty, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const currency = items[0]?.currency ?? "USD";

  if (!mounted) return <div className="container-page py-24" />;

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-28 text-center">
        <ShoppingBag className="h-12 w-12 text-muted" strokeWidth={1} />
        <h1 className="font-heading text-3xl">Tu carrito está vacío</h1>
        <p className="text-muted">Descubrí nuestras piezas seleccionadas.</p>
        <Button asChild size="lg">
          <Link href="/productos">Explorar la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="mb-10 font-heading text-4xl">Carrito</h1>
      <div className="grid gap-12 lg:grid-cols-3">
        <ul className="divide-y divide-border lg:col-span-2">
          {items.map((item) => (
            <li key={item.key} className="flex gap-5 py-6">
              <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-brand bg-fg/5">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="104px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/producto/${item.slug}`}
                      className="font-heading text-lg hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-muted">{item.variantName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(item.key)}
                    className="text-muted hover:text-fg"
                    aria-label="Quitar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center rounded-brand border border-border">
                    <button
                      onClick={() => setQty(item.key, item.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center hover:bg-fg/5"
                      aria-label="Restar"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQty(item.key, item.quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center hover:bg-fg/5"
                      aria-label="Sumar"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="tabular-nums">
                    {formatMoney(item.unitPrice * item.quantity, item.currency)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-brand border border-border bg-card p-6 lg:sticky lg:top-28">
          <h2 className="font-heading text-xl">Resumen</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="tabular-nums">
                {formatMoney(subtotal, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Envío</span>
              <span className="text-muted">Se calcula en el checkout</span>
            </div>
          </div>
          <div className="mt-6 flex justify-between border-t border-border pt-4">
            <span className="font-medium">Total estimado</span>
            <span className="font-heading text-lg tabular-nums">
              {formatMoney(subtotal, currency)}
            </span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Finalizar compra</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
