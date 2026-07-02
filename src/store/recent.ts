"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Datos mínimos para el carrusel de "vistos recientemente". */
export type RecentItem = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl?: string;
  price: number;
  currency: string;
};

type RecentState = {
  items: RecentItem[];
  add: (item: RecentItem) => void;
  clear: () => void;
};

const MAX = 12;

export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [item, ...s.items.filter((i) => i.id !== item.id)].slice(
            0,
            MAX,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "ecuestre-recent" },
  ),
);
