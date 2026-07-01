import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="container-page flex flex-col items-center gap-5 py-28 text-center">
      <CheckCircle2 className="h-16 w-16 text-primary" strokeWidth={1.25} />
      <h1 className="font-heading text-4xl">¡Gracias por tu compra!</h1>
      <p className="max-w-md text-muted">
        Tu pago se procesó correctamente. Te enviamos la confirmación por email.
        {order && (
          <>
            {" "}
            Tu número de orden es <strong className="text-fg">{order}</strong>.
          </>
        )}
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/productos">Seguir comprando</Link>
      </Button>
    </div>
  );
}
