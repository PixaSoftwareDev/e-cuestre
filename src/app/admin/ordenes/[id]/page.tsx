import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PageHeader, Panel } from "@/components/admin/ui";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

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

type ShippingAddress = {
  line1?: string;
  city?: string;
  zip?: string;
  country?: string;
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const address = (order.shippingAddress as ShippingAddress | null) ?? null;
  const hasAddress =
    address &&
    (address.line1 || address.city || address.zip || address.country);

  return (
    <div>
      <Link
        href="/admin/ordenes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <PageHeader
        title={`Orden ${order.number}`}
        description={fmtDate(order.createdAt)}
        action={<OrderStatusSelect orderId={order.id} status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel title="Items" className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 text-center font-medium">Cant.</th>
                <th className="p-4 text-right font-medium">Precio unit.</th>
                <th className="p-4 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 align-middle">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-brand border border-border object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 shrink-0 rounded-brand border border-border bg-muted/10" />
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.variantName && (
                          <div className="text-xs text-muted">{item.variantName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center tabular-nums">{item.quantity}</td>
                  <td className="p-4 text-right tabular-nums">
                    {formatMoney(item.unitPrice, order.currency)}
                  </td>
                  <td className="p-4 text-right tabular-nums">
                    {formatMoney(item.lineTotal, order.currency)}
                  </td>
                </tr>
              ))}
              {order.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted">
                    Esta orden no tiene items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Cliente">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Nombre</dt>
                <dd>{order.customerName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
                <dd className="break-all">{order.email}</dd>
              </div>
              {order.phone && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Teléfono</dt>
                  <dd>{order.phone}</dd>
                </div>
              )}
            </dl>
          </Panel>

          {hasAddress && (
            <Panel title="Envío">
              <address className="text-sm not-italic leading-relaxed">
                {address?.line1 && <div>{address.line1}</div>}
                {(address?.zip || address?.city) && (
                  <div>{[address?.zip, address?.city].filter(Boolean).join(" · ")}</div>
                )}
                {address?.country && <div>{address.country}</div>}
              </address>
            </Panel>
          )}

          <Panel title="Totales">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Envío</dt>
                <dd className="tabular-nums">{formatMoney(order.shipping, order.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Impuestos</dt>
                <dd className="tabular-nums">{formatMoney(order.tax, order.currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(order.total, order.currency)}</dd>
              </div>
            </dl>
            {order.paymentProvider && (
              <p className="mt-4 text-xs text-muted">
                Pago vía {order.paymentProvider}
                {order.paymentRef ? ` · ${order.paymentRef}` : ""}
              </p>
            )}
          </Panel>

          {order.note && (
            <Panel title="Nota">
              <p className="text-sm text-muted">{order.note}</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
