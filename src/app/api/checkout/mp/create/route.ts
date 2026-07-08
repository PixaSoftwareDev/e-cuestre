import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromCart } from "@/lib/orders";
import { createPreference, isMercadoPagoConfigured } from "@/lib/payments/mercadopago";
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
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "Mercado Pago no está configurado (falta MP_ACCESS_TOKEN)." },
      { status: 501 },
    );
  }

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // 1) Orden interna (valida precios y stock contra la base).
    const order = await createOrderFromCart(
      parsed.data.items,
      parsed.data.customer,
      "mercadopago",
    );

    // 2) Preferencia de pago en Mercado Pago.
    const { initPoint, preferenceId } = await createPreference({
      orderId: order.id,
      orderNumber: order.number,
      currency: order.currency,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: preferenceId },
    });

    return NextResponse.json({ initPoint, orderNumber: order.number });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
