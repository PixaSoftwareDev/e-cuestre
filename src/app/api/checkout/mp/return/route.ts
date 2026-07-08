import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/lib/payments/mercadopago";
import { finalizePaidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Retorno de Mercado Pago (Checkout Pro). MP redirige acá con el resultado.
 * Verificamos el pago y finalizamos la orden, luego mandamos al cliente a la
 * pantalla correspondiente.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const paymentId = sp.get("payment_id") ?? sp.get("collection_id");
  const base = req.nextUrl.origin;

  const go = (path: string) => NextResponse.redirect(`${base}${path}`);

  try {
    if (!paymentId) {
      return go("/checkout?pago=rechazado");
    }

    const pay = await getPayment(paymentId);

    if (!pay.orderId) return go("/checkout?pago=rechazado");
    const order = await prisma.order.findUnique({ where: { id: pay.orderId } });
    if (!order) return go("/checkout?pago=rechazado");

    // Idempotencia: si ya está pagada (p.ej. el webhook llegó antes), éxito.
    if (order.status === "PAID" || order.status === "FULFILLED") {
      return go(`/checkout/exito?order=${order.number}`);
    }

    if (pay.status === "approved") {
      // Verificación de monto.
      if (pay.amount !== order.total) {
        console.error(
          `[mp] Monto (${pay.amount}) != total (${order.total}) orden ${order.id}`,
        );
        return go("/checkout?pago=rechazado");
      }
      const finalized = await finalizePaidOrder(order.id, {
        captureId: paymentId,
      });
      return go(`/checkout/exito?order=${finalized.number}`);
    }

    if (pay.status === "pending") {
      return go("/checkout/exito?estado=pendiente");
    }

    return go("/checkout?pago=rechazado");
  } catch (err) {
    console.error("[mp/return]", err);
    return go("/checkout?pago=error");
  }
}
