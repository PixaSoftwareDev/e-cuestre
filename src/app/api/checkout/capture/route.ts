import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentProvider } from "@/lib/payments";
import { finalizePaidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  orderId: z.string(),
  paypalOrderId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    const { orderId, paypalOrderId } = parsed.data;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Orden inexistente." }, { status: 404 });
    }

    // Capturamos el pago en el proveedor.
    const provider = getPaymentProvider();
    const result = await provider.capturePayment(paypalOrderId);

    if (result.status !== "completed") {
      return NextResponse.json(
        { error: "El pago no pudo completarse.", status: result.status },
        { status: 402 },
      );
    }

    // Verificación de monto: el capturado debe coincidir con el total.
    if (result.amount != null && result.amount !== order.total) {
      console.error(
        `[checkout] Monto capturado (${result.amount}) != total de la orden (${order.total})`,
      );
      return NextResponse.json(
        { error: "El monto pagado no coincide con la orden." },
        { status: 400 },
      );
    }

    const finalized = await finalizePaidOrder(orderId, {
      captureId: result.captureId,
    });

    return NextResponse.json({
      ok: true,
      orderNumber: finalized.number,
      status: finalized.status,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo capturar el pago.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
