import Link from "next/link";
import {
  getDashboardStats,
  getSalesTimeseries,
  getTopProducts,
} from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PageHeader, StatCard, Panel } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/charts";
import { Badge } from "@/components/ui/badge";

const CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD";

export default async function AdminDashboard() {
  const [stats, series, top, recentOrders] = await Promise.all([
    getDashboardStats(),
    getSalesTimeseries(30),
    getTopProducts(6),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        number: true,
        email: true,
        total: true,
        currency: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen del negocio en tiempo real."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Ingresos"
          value={formatMoney(stats.revenue, CURRENCY)}
          hint={`${stats.paidOrders} órdenes pagadas`}
          accent
        />
        <StatCard
          label="Órdenes"
          value={String(stats.totalOrders)}
          hint={`${stats.pendingOrders} pendientes`}
        />
        <StatCard
          label="Productos activos"
          value={String(stats.activeProducts)}
        />
        <StatCard
          label="Stock bajo"
          value={String(stats.lowStockVariants)}
          hint="variantes con ≤ 3 unidades"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Ingresos · últimos 30 días" className="lg:col-span-2">
          <RevenueChart data={series} currency={CURRENCY} />
        </Panel>

        <Panel title="Más vendidos">
          {top.length === 0 ? (
            <p className="text-sm text-muted">Todavía no hay ventas.</p>
          ) : (
            <ul className="space-y-3">
              {top.map((t, i) => (
                <li key={t.productId ?? i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-muted tabular-nums">{i + 1}.</span>
                    <span className="truncate">{t.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {t.units} u.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Órdenes recientes" className="mt-6">
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay órdenes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Orden</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border/60">
                    <td className="py-3">
                      <Link href={`/admin/ordenes`} className="font-medium hover:text-primary">
                        {o.number}
                      </Link>
                    </td>
                    <td className="py-3 text-muted">{o.email}</td>
                    <td className="py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {formatMoney(o.total, o.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "success" | "warning" | "muted" | "danger" | "default" }> = {
    PAID: { label: "Pagada", variant: "success" },
    FULFILLED: { label: "Enviada", variant: "default" },
    PENDING: { label: "Pendiente", variant: "warning" },
    CANCELLED: { label: "Cancelada", variant: "muted" },
    REFUNDED: { label: "Reembolsada", variant: "danger" },
  };
  const s = map[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
