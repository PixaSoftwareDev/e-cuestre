import {
  getFunnel,
  getTopProducts,
  getMostViewed,
  getSalesTimeseries,
} from "@/lib/metrics";
import { formatMoney } from "@/lib/money";
import { PageHeader, Panel } from "@/components/admin/ui";
import { FunnelBars, RevenueChart } from "@/components/admin/charts";

const CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD";

export default async function MetricsPage() {
  const [funnel, top, viewed, series] = await Promise.all([
    getFunnel(30),
    getTopProducts(10),
    getMostViewed(10),
    getSalesTimeseries(30),
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
