import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Muestra una valoración de 0 a 5 en estrellas (dorado = lleno). */
export function Stars({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating.toFixed(1)} de 5`}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i <= rounded ? "fill-accent text-accent" : "fill-transparent text-fg/25"
          }
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
