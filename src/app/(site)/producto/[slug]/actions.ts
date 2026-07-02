"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
  authorName: z.string().min(2).max(80),
  email: z.string().email(),
});

/**
 * Crea una reseña (pública). Queda pendiente de aprobación por el admin.
 * Marca `verified` si el email compró ese producto (orden pagada).
 */
export async function createReview(input: unknown) {
  const data = schema.parse(input);

  const bought = await prisma.order.findFirst({
    where: {
      email: data.email,
      status: { in: ["PAID", "FULFILLED"] },
      items: { some: { productId: data.productId } },
    },
    select: { id: true },
  });

  await prisma.review.create({
    data: {
      productId: data.productId,
      rating: data.rating,
      title: data.title?.trim() || null,
      comment: data.comment?.trim() || null,
      authorName: data.authorName.trim(),
      email: data.email.trim().toLowerCase(),
      verified: Boolean(bought),
      approved: false,
    },
  });

  revalidatePath(`/producto/${data.slug}`);
  return { ok: true };
}
