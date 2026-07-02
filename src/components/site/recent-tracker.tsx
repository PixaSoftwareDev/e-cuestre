"use client";

import { useEffect } from "react";
import { useRecent, type RecentItem } from "@/store/recent";

/** Registra el producto actual en "vistos recientemente". */
export function RecentTracker({ item }: { item: RecentItem }) {
  const add = useRecent((s) => s.add);
  useEffect(() => {
    add(item);
    // solo al cambiar de producto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);
  return null;
}
