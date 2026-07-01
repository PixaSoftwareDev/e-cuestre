"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatMoney } from "@/lib/money";
import { Input, Label } from "@/components/ui/input";
import { track } from "@/lib/track";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "Argentina",
  });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && items.length > 0) {
      track({ type: "begin_checkout", value: cartSubtotal(items) });
    }
    // solo al montar con items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const currency = items[0]?.currency ?? PAYPAL_CURRENCY;

  const formValid =
    /.+@.+\..+/.test(form.email) && form.name.trim().length > 1;

  if (!mounted) return <div className="container-page py-24" />;

  if (items.length === 0) {
    return (
      <div className="container-page py-28 text-center">
        <h1 className="font-heading text-3xl">No hay nada para pagar</h1>
        <p className="mt-3 text-muted">Agregá productos antes de continuar.</p>
        <Link href="/productos" className="mt-6 inline-block underline">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container-page grid gap-12 py-12 md:grid-cols-2 md:py-16">
      {/* Datos + pago */}
      <div className="order-2 md:order-1">
        <h1 className="font-heading text-3xl">Checkout</h1>

        <div className="mt-8 space-y-4">
          <h2 className="kicker text-accent">Datos de contacto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="tu@email.com" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nombre y apellido *</Label>
              <Input id="name" value={form.name} onChange={set("name")} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} />
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Input id="country" value={form.country} onChange={set("country")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={form.address} onChange={set("address")} />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" value={form.city} onChange={set("city")} />
            </div>
            <div>
              <Label htmlFor="zip">Código postal</Label>
              <Input id="zip" value={form.zip} onChange={set("zip")} />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="kicker mb-4 text-accent">Pago</h2>
          {error && (
            <p className="mb-4 rounded-brand bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {!PAYPAL_CLIENT_ID ? (
            <div className="rounded-brand border border-dashed border-border p-6 text-sm text-muted">
              PayPal aún no está configurado. Definí{" "}
              <code className="text-fg">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> en tu{" "}
              <code className="text-fg">.env</code> para habilitar el pago. Ver la
              guía en <code className="text-fg">docs/PAYPAL.md</code>.
            </div>
          ) : (
            <>
              {!formValid && (
                <p className="mb-3 text-sm text-muted">
                  Completá tu email y nombre para habilitar el pago.
                </p>
              )}
              <div className={formValid ? "" : "pointer-events-none opacity-50"}>
                <PayPalScriptProvider
                  options={{
                    clientId: PAYPAL_CLIENT_ID,
                    currency,
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", color: "black" }}
                    createOrder={async () => {
                      setError(null);
                      const res = await fetch("/api/checkout/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          items: items.map((i) => ({
                            productId: i.productId,
                            variantId: i.variantId,
                            quantity: i.quantity,
                          })),
                          customer: {
                            email: form.email,
                            name: form.name,
                            phone: form.phone || undefined,
                            address: {
                              line1: form.address,
                              city: form.city,
                              zip: form.zip,
                              country: form.country,
                            },
                          },
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setError(data.error ?? "No se pudo iniciar el pago.");
                        throw new Error(data.error ?? "create failed");
                      }
                      // guardamos el orderId interno para la captura
                      sessionStorage.setItem("ecuestre_order_id", data.orderId);
                      return data.paypalOrderId as string;
                    }}
                    onApprove={async (data) => {
                      const orderId = sessionStorage.getItem("ecuestre_order_id");
                      const res = await fetch("/api/checkout/capture", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId,
                          paypalOrderId: data.orderID,
                        }),
                      });
                      const result = await res.json();
                      if (!res.ok) {
                        setError(result.error ?? "El pago no se completó.");
                        return;
                      }
                      track({
                        type: "purchase",
                        value: subtotal,
                        metadata: { orderNumber: result.orderNumber },
                      });
                      sessionStorage.removeItem("ecuestre_order_id");
                      clear();
                      router.push(
                        `/checkout/exito?order=${result.orderNumber}`,
                      );
                    }}
                    onError={() => {
                      setError(
                        "Ocurrió un error con PayPal. Probá de nuevo o usá otro método.",
                      );
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resumen */}
      <aside className="order-1 h-fit rounded-brand border border-border bg-card p-6 md:order-2 md:sticky md:top-28">
        <h2 className="font-heading text-xl">Tu pedido</h2>
        <ul className="mt-6 divide-y divide-border">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {i.quantity}× {i.name}
                {i.variantName ? ` · ${i.variantName}` : ""}
              </span>
              <span className="tabular-nums">
                {formatMoney(i.unitPrice * i.quantity, i.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="tabular-nums">{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Envío</span>
            <span className="text-muted">Gratis</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base">
            <span className="font-medium">Total</span>
            <span className="font-heading tabular-nums">
              {formatMoney(subtotal, currency)}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
