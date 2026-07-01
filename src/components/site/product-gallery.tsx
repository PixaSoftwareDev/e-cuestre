"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Img = { url: string; alt?: string | null };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="aspect-[4/5] w-full rounded-brand bg-fg/5" />;
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-brand border transition-all",
                i === active
                  ? "border-primary"
                  : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-brand bg-fg/5">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
