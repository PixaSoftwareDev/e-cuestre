import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/admin/ui";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const STATUS_FILTERS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pendientes" },
  { value: "PAID", label: "Pagadas" },
  { value: "FULFILLED", label: "Enviadas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "REFUNDED", label: "Reembolsadas" },
];

function isOrderStatus(v: string | undefined): v is OrderStatus {
  return !!v && STATUS_FILTERS.some((f) => f.value === v);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const active = isOrderStatus(estado) ? estado : undefined;

  const orders = await prisma.order.findMany({
    where: active ? { status: active } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader title="Órdenes" description={`${orders.length} órdenes`} />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip label="Todas" href="/admin/ordenes" active={!active} />
        {STATUS_FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            href={`/admin/ordenes?estado=${f.value}`}
            active={active === f.value}
          />
        ))}
      </div>

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
              <tr key={o.id} className="border-b border-border/60 align-top transition-colors hover:bg-muted/5">
                <td className="p-4 font-medium">
                  <Link href={`/admin/ordenes/${o.id}`} className="hover:text-accent">
                    {o.number}
                  </Link>
                </td>
                <td className="p-4 text-muted">
                  <Link href={`/admin/ordenes/${o.id}`} className="block">
                    {fmtDate(o.createdAt)}
                  </Link>
                </td>
                <td className="p-4">
                  <Link href={`/admin/ordenes/${o.id}`} className="block">
                    <div>{o.customerName ?? "—"}</div>
                    <div className="text-xs text-muted">{o.email}</div>
                  </Link>
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
                  {active
                    ? "No hay órdenes con este estado."
                    : "Todavía no hay órdenes."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent text-primary-fg"
          : "border-border bg-card text-muted hover:text-fg",
      )}
    >
      {label}
    </Link>
  );
}
