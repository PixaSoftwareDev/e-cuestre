"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  /** id único de línea = productId + variantId */
  key: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantName?: string;
  imageUrl?: string;
  /** precio unitario en centavos */
  unitPrice: number;
  currency: string;
  quantity: number;
  /** stock disponible al momento de agregar (para límites en UI) */
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "key" | "quantity">, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, qty = 1) =>
        set((state) => {
          const key = `${item.productId}:${item.variantId}`;
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            const nextQty = Math.min(
              existing.quantity + qty,
              item.maxStock || 99,
            );
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: nextQty } : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, key, quantity: Math.min(qty, item.maxStock || 99) },
            ],
            isOpen: true,
          };
        }),
      remove: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.key === key
                ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock || 99)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "ecuestre-cart" },
  ),
);

/** Selectores derivados */
export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
