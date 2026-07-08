import Link from "next/link";
import {
  getDashboardStats,
  getSalesTimeseries,
  getTopProducts,
  getRevenueSince,
  getAverageOrderValue,
  getFunnel,
  getSidebarCounts,
} from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PageHeader, StatCard, Panel } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/charts";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/admin/count-up";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Receipt,
  Percent,
  Star,
} from "lucide-react";

const CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD";

export default async function AdminDashboard() {
  const [stats, series, top, recentOrders, rev7, aov, funnel, counts] =
    await Promise.all([
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
      getRevenueSince(7),
      getAverageOrderValue(),
      getFunnel(30),
      getSidebarCounts(),
    ]);

  const conversion = funnel.page_view
    ? (funnel.purchase / funnel.page_view) * 100
    : 0;

  return (
    <div>
      <PageHeader
        kicker="Panel"
        title="Dashboard"
        description="Resumen del negocio en tiempo real."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Ingresos"
          value={<CountUp value={stats.revenue} currency={CURRENCY} />}
          hint={`${stats.paidOrders} órdenes pagadas`}
          icon={<DollarSign className="h-4 w-4" strokeWidth={1.75} />}
          accent
        />
        <StatCard
          label="Órdenes"
          value={<CountUp value={stats.totalOrders} />}
          hint={`${stats.pendingOrders} pendientes`}
          icon={<ShoppingCart className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Productos activos"
          value={<CountUp value={stats.activeProducts} />}
          icon={<Package className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Stock bajo"
          value={<CountUp value={stats.lowStockVariants} />}
          hint="variantes con ≤ 3 unidades"
          icon={<AlertTriangle className="h-4 w-4" strokeWidth={1.75} />}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Ingresos · 7 días"
          value={<CountUp value={rev7.revenue} currency={CURRENCY} />}
          hint={`${rev7.orders} órdenes`}
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Ticket promedio"
          value={<CountUp value={aov} currency={CURRENCY} />}
          hint="por orden pagada"
          icon={<Receipt className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Conversión"
          value={`${conversion.toFixed(1)}%`}
          hint="visitas → compra (30d)"
          icon={<Percent className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Reseñas pendientes"
          value={<CountUp value={counts.pendingReviews} />}
          hint="por aprobar"
          icon={<Star className="h-4 w-4" strokeWidth={1.75} />}
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
                  <tr
                    key={o.id}
                    className="border-b border-border/60 transition-colors hover:bg-fg/[0.02]"
                  >
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
