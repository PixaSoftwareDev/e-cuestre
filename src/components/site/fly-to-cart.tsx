"use client";

import { motion } from "motion/react";
import { useFly, type Fly } from "@/store/fly";

/** Capa que anima la imagen "volando" hacia el ícono del carrito al agregar. */
export function FlyToCartLayer() {
  const flies = useFly((s) => s.flies);
  const remove = useFly((s) => s.remove);
  return (
    <>
      {flies.map((f) => (
        <FlyItem key={f.id} fly={f} onDone={() => remove(f.id)} />
      ))}
    </>
  );
}

function FlyItem({ fly, onDone }: { fly: Fly; onDone: () => void }) {
  const cart =
    typeof document !== "undefined"
      ? document.getElementById("nav-cart-icon")
      : null;
  const to = cart?.getBoundingClientRect();

  const fromCx = fly.from.left + fly.from.width / 2;
  const fromCy = fly.from.top + fly.from.height / 2;
  const toCx = to ? to.left + to.width / 2 : fromCx;
  const toCy = to ? to.top + to.height / 2 : 0;

  return (
    <motion.img
      src={fly.imageUrl}
      alt=""
      aria-hidden
      initial={{
        opacity: 0.95,
        x: 0,
        y: 0,
        scale: 1,
      }}
      animate={{
        x: toCx - fromCx,
        y: toCy - fromCy,
        scale: 0.18,
        opacity: 0.25,
      }}
      transition={{ duration: 0.75, ease: [0.5, 0, 0.75, 0.2] }}
      onAnimationComplete={onDone}
      style={{
        position: "fixed",
        left: fly.from.left,
        top: fly.from.top,
        width: fly.from.width,
        height: fly.from.height,
        objectFit: "cover",
        borderRadius: 12,
        zIndex: 80,
        pointerEvents: "none",
      }}
    />
  );
}
