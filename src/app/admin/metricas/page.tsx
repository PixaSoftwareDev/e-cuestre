import {
  getFunnel,
  getTopProducts,
  getMostViewed,
  getSalesTimeseries,
  getRevenueByBrand,
  getRevenueByCategory,
  getConversionByDevice,
  getCartAbandonment,
  getReturningCustomers,
} from "@/lib/metrics";
import { formatMoney } from "@/lib/money";
import { PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { FunnelBars, RevenueChart } from "@/components/admin/charts";
import { CountUp } from "@/components/admin/count-up";
import { ShoppingCart, Repeat, Eye, Percent } from "lucide-react";

const CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD";
const RANGE_DAYS = 30;

export default async function MetricsPage() {
  const [
    funnel,
    top,
    viewed,
    series,
    revenueByBrand,
    revenueByCategory,
    conversionByDevice,
    cartAbandonment,
    returningCustomers,
  ] = await Promise.all([
    getFunnel(RANGE_DAYS),
    getTopProducts(10),
    getMostViewed(10),
    getSalesTimeseries(RANGE_DAYS),
    getRevenueByBrand(),
    getRevenueByCategory(),
    getConversionByDevice(RANGE_DAYS),
    getCartAbandonment(RANGE_DAYS),
    getReturningCustomers(),
  ]);

  const funnelData = [
    { stage: "Vieron el sitio", value: funnel.page_view },
    { stage: "Vieron producto", value: funnel.product_view },
    { stage: "Agregaron", value: funnel.add_to_cart },
    { stage: "Checkout", value: funnel.begin_checkout },
    { stage: "Compraron", value: funnel.purchase },
  ];

  const convRate =
    funnel.product_view > 0
      ? ((funnel.purchase / funnel.product_view) * 100).toFixed(1)
      : "0.0";

  return (
    <div>
      <PageHeader
        title="Métricas"
        description="Qué se vende, qué se mira y dónde se cae la conversión (últimos 30 días)."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Visitas · 30 días"
          value={<CountUp value={funnel.page_view} />}
          hint="páginas vistas"
          icon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Conversión"
          value={`${convRate}%`}
          hint="vista → compra"
          icon={<Percent className="h-4 w-4" strokeWidth={1.75} />}
          accent
        />
        <StatCard
          label="Abandono de carrito"
          value={`${cartAbandonment.rate.toFixed(1)}%`}
          hint={`${cartAbandonment.abandoned} de ${cartAbandonment.carts} carritos`}
          icon={<ShoppingCart className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Clientes que vuelven"
          value={`${returningCustomers.rate.toFixed(1)}%`}
          hint={`${returningCustomers.returning} de ${returningCustomers.customers} clientes`}
          icon={<Repeat className="h-4 w-4" strokeWidth={1.75} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Ingresos · 30 días" className="lg:col-span-2">
          <RevenueChart data={series} currency={CURRENCY} />
        </Panel>
        <Panel title="Embudo de conversión">
          <FunnelBars data={funnelData} />
          <p className="mt-2 text-center text-sm text-muted">
            Conversión vista→compra:{" "}
            <span className="font-medium text-fg">{convRate}%</span>
          </p>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Ingresos por marca">
          <RevenueBars rows={revenueByBrand} empty="Sin ventas todavía." />
        </Panel>
        <Panel title="Ingresos por categoría">
          <RevenueBars rows={revenueByCategory} empty="Sin ventas todavía." />
        </Panel>
      </div>

      <Panel title="Conversión por dispositivo" className="mt-6">
        {conversionByDevice.length === 0 ? (
          <p className="text-sm text-muted">Sin datos de dispositivos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Dispositivo</th>
                  <th className="pb-2 text-right font-medium">Visitas</th>
                  <th className="pb-2 text-right font-medium">Compras</th>
                  <th className="pb-2 text-right font-medium">Tasa</th>
                </tr>
              </thead>
              <tbody>
                {conversionByDevice.map((d) => (
                  <tr
                    key={d.device}
                    className="border-b border-border/60 transition-colors hover:bg-fg/[0.02]"
                  >
                    <td className="py-3 capitalize">{d.device}</td>
                    <td className="py-3 text-right tabular-nums">{d.views}</td>
                    <td className="py-3 text-right tabular-nums">{d.purchases}</td>
                    <td className="py-3 text-right font-medium tabular-nums">
                      {d.rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Más vendidos (unidades)">
          <MetricList
            rows={top.map((t) => ({
              name: t.name,
              main: `${t.units} u.`,
              sub: formatMoney(t.revenue, CURRENCY),
            }))}
            empty="Sin ventas todavía."
          />
        </Panel>
        <Panel title="Más vistos">
          <MetricList
            rows={viewed.map((v) => ({ name: v.name, main: `${v.views} vistas` }))}
            empty="Sin vistas registradas."
          />
        </Panel>
      </div>
    </div>
  );
}

function RevenueBars({
  rows,
  empty,
}: {
  rows: { name: string; revenue: number }[];
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate">{r.name}</span>
            <span className="shrink-0 tabular-nums">
              {formatMoney(r.revenue, CURRENCY)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-fg/[0.06]">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max((r.revenue / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MetricList({
  rows,
  empty,
}: {
  rows: { name: string; main: string; sub?: string }[];
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={i} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-5 shrink-0 text-muted tabular-nums">{i + 1}.</span>
            <span className="truncate">{r.name}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="tabular-nums">{r.main}</span>
            {r.sub && <span className="block text-xs text-muted">{r.sub}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
