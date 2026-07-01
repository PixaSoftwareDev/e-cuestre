"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove } = useCart();
  const subtotal = cartSubtotal(items);
  const currency = items[0]?.currency ?? "USD";

  // Bloquea el scroll del body cuando el drawer está abierto.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bg shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Carrito de compras"
          >
            <header className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-heading text-xl">Tu carrito</h2>
              <button
                onClick={close}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-brand hover:bg-fg/5"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-10 w-10 text-muted" strokeWidth={1} />
                <p className="text-muted">Tu carrito está vacío.</p>
                <Button variant="outline" size="sm" onClick={close}>
                  Seguir explorando
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={item.key} className="flex gap-4 py-5">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-brand bg-fg/5">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <Link
                            href={`/producto/${item.slug}`}
                            onClick={close}
                            className="text-sm font-medium leading-snug hover:underline"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => remove(item.key)}
                            aria-label="Quitar"
                            className="text-muted hover:text-fg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {item.variantName && (
                          <span className="text-xs text-muted">
                            {item.variantName}
                          </span>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-brand border border-border">
                            <button
                              onClick={() => setQty(item.key, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center hover:bg-fg/5"
                              aria-label="Restar"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => setQty(item.key, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center hover:bg-fg/5"
                              aria-label="Sumar"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-medium tabular-nums">
                            {formatMoney(item.unitPrice * item.quantity, item.currency)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-border px-6 py-5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-muted">Subtotal</span>
                    <span className="font-heading text-lg tabular-nums">
                      {formatMoney(subtotal, currency)}
                    </span>
                  </div>
                  <p className="mb-4 text-xs text-muted">
                    Envío e impuestos calculados en el checkout.
                  </p>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/checkout" onClick={close}>
                      Finalizar compra
                    </Link>
                  </Button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
