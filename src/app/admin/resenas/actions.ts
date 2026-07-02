"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");
}

export async function approveReview(id: string) {
  await requireAdmin();
  await prisma.review.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/resenas");
  return { ok: true };
}

export async function unapproveReview(id: string) {
  await requireAdmin();
  await prisma.review.update({ where: { id }, data: { approved: false } });
  revalidatePath("/admin/resenas");
  return { ok: true };
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/resenas");
  return { ok: true };
}
