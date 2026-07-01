"use client";

import { ShoppingBag } from "lucide-react";
import { useCart, cartCount } from "@/store/cart";
import { useEffect, useState } from "react";

export function CartButton() {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <button
      onClick={open}
      aria-label="Abrir carrito"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-brand transition-colors hover:bg-fg/5"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-fg">
          {count}
        </span>
      )}
    </button>
  );
}
