import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/admin/ui";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader title="Órdenes" description={`${orders.length} órdenes recientes`} />

      <div className="overflow-hidden rounded-brand border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-4 font-medium">Orden</th>
              <th className="p-4 font-medium">Fecha</th>
              <th className="p-4 font-medium">Cliente</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 text-right font-medium">Total</th>
              <th className="p-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border/60 align-top">
                <td className="p-4 font-medium">{o.number}</td>
                <td className="p-4 text-muted">{fmtDate(o.createdAt)}</td>
                <td className="p-4">
                  <div>{o.customerName ?? "—"}</div>
                  <div className="text-xs text-muted">{o.email}</div>
                </td>
                <td className="p-4 text-muted">
                  {o.items.reduce((n, i) => n + i.quantity, 0)} u.
                </td>
                <td className="p-4 text-right tabular-nums">
                  {formatMoney(o.total, o.currency)}
                </td>
                <td className="p-4">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted">
                  Todavía no hay órdenes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
