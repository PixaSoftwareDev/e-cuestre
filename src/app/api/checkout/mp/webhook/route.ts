import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/lib/payments/mercadopago";
import { finalizePaidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Webhook de Mercado Pago: notificación asíncrona de pagos. Cuando un pago se
 * aprueba, finalizamos la orden (idempotente). Requiere URL pública (en dev con
 * túnel o en producción). Si no llega, el retorno del cliente ya cubre el caso.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body?.type ?? req.nextUrl.searchParams.get("type");
    const paymentId =
      body?.data?.id ?? req.nextUrl.searchParams.get("data.id");

    if (type !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true }); // ignorar otros eventos
    }

    const pay = await getPayment(String(paymentId));
    if (pay.status === "approved" && pay.orderId) {
      const order = await prisma.order.findUnique({ where: { id: pay.orderId } });
      if (
        order &&
        order.status !== "PAID" &&
        order.status !== "FULFILLED" &&
        pay.amount === order.total
      ) {
        await finalizePaidOrder(order.id, { captureId: String(paymentId) });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[mp/webhook]", err);
    // Respondemos 200 igual para que MP no reintente indefinidamente.
    return NextResponse.json({ ok: true });
  }
}
