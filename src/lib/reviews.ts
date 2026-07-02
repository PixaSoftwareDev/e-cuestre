import "server-only";
import { prisma } from "@/lib/prisma";

export type ReviewStats = {
  avg: number;
  count: number;
  /** cantidad por cada puntaje (1..5) */
  dist: Record<number, number>;
};

/** Reseñas aprobadas de un producto (más recientes primero). */
export function getApprovedReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Promedio, cantidad y distribución de un producto (solo aprobadas). */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    select: { rating: true },
  });
  const count = reviews.length;
  const sum = reviews.reduce((n, r) => n + r.rating, 0);
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) dist[r.rating] = (dist[r.rating] ?? 0) + 1;
  return { avg: count ? sum / count : 0, count, dist };
}

/** Promedio + cantidad de varios productos de una (para las tarjetas). */
export async function getReviewStatsMap(
  productIds: string[],
): Promise<Record<string, { avg: number; count: number }>> {
  if (!productIds.length) return {};
  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, approved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const map: Record<string, { avg: number; count: number }> = {};
  for (const g of grouped) {
    map[g.productId] = { avg: g._avg.rating ?? 0, count: g._count.rating };
  }
  return map;
}
