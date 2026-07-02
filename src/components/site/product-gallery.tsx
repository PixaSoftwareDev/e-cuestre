"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type Img = { url: string; alt?: string | null };

export function ProductGallery({
  images,
  name,
  slug,
}: {
  images: Img[];
  name: string;
  slug?: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frameRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <div className="aspect-[4/5] w-full rounded-brand bg-fg/5" />;
  }

  function onMove(e: React.MouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-brand transition-opacity",
                i === active ? "opacity-100" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
              {i === active && (
                <motion.span
                  layoutId="gallery-thumb-active"
                  className="pointer-events-none absolute inset-0 rounded-brand ring-2 ring-primary ring-inset"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div
        ref={frameRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-brand bg-fg/5"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[active].url}
              alt={images[active].alt ?? name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out"
              style={{
                transform: zoom ? "scale(1.7)" : "scale(1)",
                transformOrigin: origin,
                viewTransitionName:
                  slug && active === 0 ? `product-${slug}` : undefined,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
