"use client";

import { create } from "zustand";

export type Fly = {
  id: number;
  imageUrl: string;
  from: { left: number; top: number; width: number; height: number };
};

type FlyState = {
  flies: Fly[];
  trigger: (imageUrl: string, from: DOMRect) => void;
  remove: (id: number) => void;
};

let counter = 0;

export const useFly = create<FlyState>((set) => ({
  flies: [],
  trigger: (imageUrl, rect) => {
    if (!imageUrl) return;
    const id = ++counter;
    set((s) => ({
      flies: [
        ...s.flies,
        {
          id,
          imageUrl,
          from: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          },
        },
      ],
    }));
  },
  remove: (id) => set((s) => ({ flies: s.flies.filter((f) => f.id !== id) })),
}));
