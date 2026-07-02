"use client";

import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart, cartCount } from "@/store/cart";
import { useEffect, useRef, useState } from "react";

export function CartButton() {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const [mounted, setMounted] = useState(false);
  const [bump, setBump] = useState(false);
  const prev = useRef(0);

  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;

  // Al aumentar la cantidad, dispara un pequeño "bump" del ícono.
  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  return (
    <button
      id="nav-cart-icon"
      onClick={open}
      aria-label="Abrir carrito"
      className="nav-icon relative inline-flex h-11 w-11 items-center justify-center"
    >
      <motion.span
        animate={bump ? { scale: [1, 0.82, 1.18, 1], rotate: [0, -6, 6, 0] } : {}}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      </motion.span>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-fg tabular-nums"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
