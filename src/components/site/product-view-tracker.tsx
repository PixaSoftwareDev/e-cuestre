"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

export function ProductViewTracker({
  productId,
  brandId,
  price,
}: {
  productId: string;
  brandId: string;
  price: number;
}) {
  useEffect(() => {
    track({ type: "product_view", productId, brandId, value: price });
  }, [productId, brandId, price]);
  return null;
}
