"use client";

import { create } from "zustand";

export type Toast = {
  id: number;
  message: string;
  /** Muestra un botón "Ver carrito" que abre el drawer. */
  cart?: boolean;
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, opts?: { cart?: boolean }) => void;
  remove: (id: number) => void;
};

let counter = 0;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, opts) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, message, cart: opts?.cart }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3400);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
