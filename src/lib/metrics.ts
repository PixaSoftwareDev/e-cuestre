import "server-only";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const PAID_STATES: OrderStatus[] = [OrderStatus.PAID, OrderStatus.FULFILLED];

export async function getDashboardStats() {
  const [paidAgg, ordersCount, pendingCount, productsCount, lowStock] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: PAID_STATES } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.productVariant.count({ where: { stock: { lte: 3 } } }),
    ]);

  return {
    revenue: paidAgg._sum.total ?? 0,
    paidOrders: paidAgg._count,
    totalOrders: ordersCount,
    pendingOrders: pendingCount,
    activeProducts: productsCount,
    lowStockVariants: lowStock,
  };
}

/** Serie diaria de ingresos y órdenes pagadas de los últimos `days` días. */
export async function getSalesTimeseries(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: PAID_STATES },
      createdAt: { gte: since },
    },
    select: { total: true, createdAt: true },
  });

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const entry = byDay.get(key);
    if (entry) {
      entry.revenue += o.total;
      entry.orders += 1;
    }
  }
  return Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }));
}

/** Embudo de conversión a partir de los eventos de analítica. */
export async function getFunnel(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["type"],
    where: { createdAt: { gte: since } },
    _count: true,
  });
  const map = Object.fromEntries(rows.map((r) => [r.type, r._count]));
  return {
    page_view: map["page_view"] ?? 0,
    product_view: map["product_view"] ?? 0,
    add_to_cart: map["add_to_cart"] ?? 0,
    begin_checkout: map["begin_checkout"] ?? 0,
    purchase: map["purchase"] ?? 0,
  };
}

/** Productos más vendidos (por unidades) sobre órdenes pagadas. */
export async function getTopProducts(limit = 8) {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId", "name"],
    where: { order: { status: { in: PAID_STATES } } },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({
    productId: r.productId,
    name: r.name,
    units: r._sum.quantity ?? 0,
    revenue: r._sum.lineTotal ?? 0,
  }));
}

/** Productos más vistos que NO se venden (vistas altas, ventas bajas). */
export async function getMostViewed(limit = 8) {
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["productId"],
    where: { type: "product_view", productId: { not: null } },
    _count: true,
    orderBy: { _count: { productId: "desc" } },
    take: limit,
  });
  const ids = rows.map((r) => r.productId!).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  const nameOf = Object.fromEntries(products.map((p) => [p.id, p.name]));
  return rows.map((r) => ({
    productId: r.productId!,
    name: nameOf[r.productId!] ?? "—",
    views: r._count,
  }));
}
