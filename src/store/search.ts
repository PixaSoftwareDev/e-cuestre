"use client";

import { create } from "zustand";

type SearchState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

export const useSearch = create<SearchState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
