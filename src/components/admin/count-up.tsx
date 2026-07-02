"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { formatMoney } from "@/lib/money";

/**
 * Anima un número desde 0 hasta el valor. Si se pasa `currency`, lo formatea
 * como dinero. (Props serializables: no recibe funciones desde el servidor.)
 */
export function CountUp({
  value,
  currency,
}: {
  value: number;
  currency?: string;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [value]);
  const rounded = Math.round(n);
  return (
    <>{currency ? formatMoney(rounded, currency) : rounded.toLocaleString("es-AR")}</>
  );
}
