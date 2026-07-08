import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromCart } from "@/lib/orders";
import { getPaymentProvider } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  customer: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.record(z.string(), z.unknown()).optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // 1) Orden interna (valida precios y stock contra la base).
    const order = await createOrderFromCart(
      parsed.data.items,
      parsed.data.customer,
      "paypal",
    );

    // 2) Orden en el proveedor de pago (PayPal).
    const provider = getPaymentProvider();
    const { providerOrderId } = await provider.createPayment({
      orderId: order.id,
      orderNumber: order.number,
      currency: order.currency,
      amount: order.total,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });

    // Guardamos la referencia del proveedor.
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: providerOrderId },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.number,
      paypalOrderId: providerOrderId,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo crear la orden.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
