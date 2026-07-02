"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Datos mínimos para render en la página de favoritos (sin refetch). */
export type FavItem = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl?: string;
  price: number;
  currency: string;
};

type FavState = {
  items: FavItem[];
  toggle: (item: FavItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useFavorites = create<FavState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((s) =>
          s.items.some((i) => i.id === item.id)
            ? { items: s.items.filter((i) => i.id !== item.id) }
            : { items: [...s.items, item] },
        ),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "ecuestre-favorites" },
  ),
);

export const favCount = (items: FavItem[]) => items.length;
