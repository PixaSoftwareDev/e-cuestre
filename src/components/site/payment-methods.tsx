import Image from "next/image";
import { cn } from "@/lib/utils";

const METHODS = [
  { src: "/payments/mercadopago.png", alt: "Mercado Pago" },
  { src: "/payments/visa.svg", alt: "Visa" },
  { src: "/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/payments/amex.svg", alt: "American Express" },
  { src: "/payments/paypal.svg", alt: "PayPal" },
];

/** Logos oficiales de los medios de pago aceptados (procesados vía PayPal). */
export function PaymentMethods({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  const w = Math.round((size * 780) / 500); // mantiene el aspecto 780x500
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {METHODS.map((m) => (
        <Image
          key={m.alt}
          src={m.src}
          alt={m.alt}
          title={m.alt}
          width={w}
          height={size}
          unoptimized
          className="rounded-[4px] ring-1 ring-black/10 dark:ring-white/15"
        />
      ))}
    </div>
  );
}
