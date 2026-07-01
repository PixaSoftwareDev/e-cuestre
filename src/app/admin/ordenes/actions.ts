"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const VALID = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"] as const;

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");
  if (!VALID.includes(status as (typeof VALID)[number])) {
    throw new Error("Estado inválido");
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as (typeof VALID)[number] },
  });
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin");
  return { ok: true };
}
