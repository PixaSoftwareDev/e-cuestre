"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendOrderShipped } from "@/lib/email";

const VALID = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"] as const;

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");
  if (!VALID.includes(status as (typeof VALID)[number])) {
    throw new Error("Estado inválido");
  }
  const prev = await prisma.order.findUnique({ where: { id: orderId } });
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as (typeof VALID)[number] },
    include: { items: true },
  });

  // Al marcar como "Enviada" (por primera vez), avisamos al cliente.
  if (status === "FULFILLED" && prev?.status !== "FULFILLED") {
    await sendOrderShipped({
      number: updated.number,
      email: updated.email,
      customerName: updated.customerName,
      total: updated.total,
      currency: updated.currency,
      items: updated.items.map((i) => ({
        name: i.name,
        variantName: i.variantName,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
    }).catch(() => {});
  }

  revalidatePath("/admin/ordenes");
  revalidatePath("/admin");
  return { ok: true };
}
