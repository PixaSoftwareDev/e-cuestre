"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { useToast } from "@/store/toast";
import { useCart } from "@/store/cart";

/** Notificaciones flotantes (abajo a la derecha). */
export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);
  const openCart = useCart((s) => s.open);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-brand border border-border bg-bg/95 px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur-md"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Check className="h-4 w-4" strokeWidth={2} />
            </span>
            <p className="flex-1 text-sm">{t.message}</p>
            {t.cart && (
              <button
                onClick={() => {
                  openCart();
                  remove(t.id);
                }}
                className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver carrito
              </button>
            )}
            <button
              onClick={() => remove(t.id)}
              aria-label="Cerrar"
              className="shrink-0 text-muted transition-colors hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
