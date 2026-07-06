import Image from "next/image";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";

/**
 * Logo de marca (imagen + "E-cuestre"). Server-safe.
 * La imagen se adapta al tema: negra en claro, blanca en oscuro.
 * Controlá el tamaño con `imgClassName` (alto) y `textClassName`.
 */
export function Logo({
  className,
  imgClassName = "h-8 md:h-9",
  textClassName = "text-xl md:text-2xl",
  showText = true,
}: {
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={withBasePath("/logo-negro.png")}
        alt="Ecuestre"
        width={48}
        height={46}
        sizes="48px"
        className={cn("w-auto dark:hidden", imgClassName)}
      />
      <Image
        src={withBasePath("/logo-blanco.png")}
        alt=""
        aria-hidden
        width={48}
        height={46}
        sizes="48px"
        className={cn("hidden w-auto dark:block", imgClassName)}
      />
      {showText && (
        <span className={cn("font-heading tracking-tight", textClassName)}>
          <span className="text-accent">E</span>
          <span className="mx-[0.12em] text-accent">-</span>
          <span className="text-fg">cuestre</span>
        </span>
      )}
    </span>
  );
}
