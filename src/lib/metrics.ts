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

/** Ingresos y órdenes pagadas de los últimos `days` días. */
export async function getRevenueSince(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const agg = await prisma.order.aggregate({
    where: { status: { in: PAID_STATES }, createdAt: { gte: since } },
    _sum: { total: true },
    _count: true,
  });
  return { revenue: agg._sum.total ?? 0, orders: agg._count };
}

/** Ticket promedio (AOV) sobre órdenes pagadas. */
export async function getAverageOrderValue() {
  const agg = await prisma.order.aggregate({
    where: { status: { in: PAID_STATES } },
    _avg: { total: true },
  });
  return Math.round(agg._avg.total ?? 0);
}

/** Conteos accionables para los badges del sidebar. */
export async function getSidebarCounts() {
  const [pendingOrders, pendingReviews, lowStock] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.productVariant.count({ where: { stock: { lte: 3 } } }),
  ]);
  return { pendingOrders, pendingReviews, lowStock };
}

/** Ingresos por marca (sobre órdenes pagadas). */
export async function getRevenueByBrand() {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: PAID_STATES } } },
    select: { lineTotal: true, product: { select: { brand: { select: { name: true } } } } },
  });
  const byBrand = new Map<string, number>();
  for (const it of items) {
    const name = it.product?.brand?.name ?? "Sin marca";
    byBrand.set(name, (byBrand.get(name) ?? 0) + it.lineTotal);
  }
  return [...byBrand.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Ingresos por categoría (sobre órdenes pagadas). */
export async function getRevenueByCategory() {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: PAID_STATES } } },
    select: { lineTotal: true, product: { select: { category: { select: { name: true } } } } },
  });
  const byCat = new Map<string, number>();
  for (const it of items) {
    const name = it.product?.category?.name ?? "Sin categoría";
    byCat.set(name, (byCat.get(name) ?? 0) + it.lineTotal);
  }
  return [...byCat.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Conversión (vista→compra) por dispositivo. */
export async function getConversionByDevice(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["device", "type"],
    where: { createdAt: { gte: since }, type: { in: ["page_view", "purchase"] } },
    _count: true,
  });
  const byDevice = new Map<string, { views: number; purchases: number }>();
  for (const r of rows) {
    const dev = r.device ?? "desconocido";
    const e = byDevice.get(dev) ?? { views: 0, purchases: 0 };
    if (r.type === "page_view") e.views += r._count;
    else e.purchases += r._count;
    byDevice.set(dev, e);
  }
  return [...byDevice.entries()]
    .map(([device, v]) => ({
      device,
      views: v.views,
      purchases: v.purchases,
      rate: v.views ? (v.purchases / v.views) * 100 : 0,
    }))
    .sort((a, b) => b.views - a.views);
}

/** Abandono de carrito: sesiones que agregaron al carrito pero no compraron. */
export async function getCartAbandonment(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const [carts, purchases] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { type: "add_to_cart", createdAt: { gte: since } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    }),
    prisma.analyticsEvent.findMany({
      where: { type: "purchase", createdAt: { gte: since } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    }),
  ]);
  const bought = new Set(purchases.map((p) => p.sessionId));
  const abandoned = carts.filter((c) => !bought.has(c.sessionId)).length;
  return {
    carts: carts.length,
    abandoned,
    rate: carts.length ? (abandoned / carts.length) * 100 : 0,
  };
}

/** Clientes que vuelven: emails con más de una orden pagada. */
export async function getReturningCustomers() {
  const rows = await prisma.order.groupBy({
    by: ["email"],
    where: { status: { in: PAID_STATES } },
    _count: true,
  });
  const returning = rows.filter((r) => r._count > 1).length;
  return {
    customers: rows.length,
    returning,
    rate: rows.length ? (returning / rows.length) * 100 : 0,
  };
}
