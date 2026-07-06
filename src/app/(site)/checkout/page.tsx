"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, Lock, ShieldCheck, Truck } from "lucide-react";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import { useCart, cartSubtotal } from "@/store/cart";
import { formatMoney } from "@/lib/money";
import { Input, Label, Select } from "@/components/ui/input";
import { PaymentMethods } from "@/components/site/payment-methods";
import { Button } from "@/components/ui/button";
import { COUNTRIES, DEFAULT_COUNTRY, findCountry } from "@/lib/countries";
import { withBasePath } from "@/lib/base-path";
import { CityCombobox } from "@/components/site/city-combobox";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD";
const MP_ENABLED = Boolean(process.env.NEXT_PUBLIC_MP_ENABLED);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"mp" | "paypal">(
    MP_ENABLED ? "mp" : "paypal",
  );
  const [mpLoading, setMpLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: DEFAULT_COUNTRY,
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

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const country = findCountry(form.country);
  const phoneFull = form.phone ? `${country.dial} ${form.phone}` : undefined;

  async function payWithMP() {
    if (!formValid || mpLoading) return;
    setError(null);
    setMpLoading(true);
    try {
      const res = await fetch("/api/checkout/mp/create", {
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
            phone: phoneFull,
            address: {
              line1: form.address,
              city: form.city,
              zip: form.zip,
              country: country.name,
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.initPoint) {
        setError(data.error ?? "No se pudo iniciar el pago con Mercado Pago.");
        setMpLoading(false);
        return;
      }
      // Redirige a Mercado Pago (Checkout Pro).
      window.location.href = data.initPoint;
    } catch {
      setError("No pudimos conectar con Mercado Pago. Probá de nuevo.");
      setMpLoading(false);
    }
  }

  const anyMethod = MP_ENABLED || Boolean(PAYPAL_CLIENT_ID);

  return (
    <div className="container-page grid gap-12 py-12 md:grid-cols-2 md:py-16">
      {/* Datos + pago */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="order-2 md:order-1"
      >
        <h1 className="font-heading text-3xl">Checkout</h1>

        {/* Stepper */}
        <ol className="mt-6 flex items-center gap-3 text-sm">
          <Step n={1} label="Tus datos" done={formValid} active={!formValid} />
          <span className="h-px w-8 bg-border" />
          <Step n={2} label="Pago" done={false} active={formValid} />
        </ol>

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
              <Label htmlFor="country">País</Label>
              <Select
                id="country"
                value={form.country}
                onChange={set("country")}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-brand border border-r-0 border-border bg-fg/5 px-3 text-sm text-muted">
                  {country.dial}
                </span>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={set("phone")}
                  inputMode="tel"
                  placeholder="11 2345 6789"
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={form.address}
                onChange={set("address")}
                autoComplete="street-address"
                placeholder="Calle y número"
              />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              {form.country === "AR" ? (
                <CityCombobox
                  id="city"
                  value={form.city}
                  onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                />
              ) : (
                <Input
                  id="city"
                  value={form.city}
                  onChange={set("city")}
                  autoComplete="address-level2"
                />
              )}
            </div>
            <div>
              <Label htmlFor="zip">Código postal</Label>
              <Input
                id="zip"
                value={form.zip}
                onChange={set("zip")}
                autoComplete="postal-code"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="kicker text-accent">Pago</h2>
            <PaymentMethods size={26} />
          </div>
          {error && (
            <p className="mb-4 rounded-brand bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          {!formValid && anyMethod && (
            <p className="mb-3 text-sm text-muted">
              Completá tu email y nombre para habilitar el pago.
            </p>
          )}

          {!anyMethod ? (
            <div className="rounded-brand border border-dashed border-border p-6 text-sm text-muted">
              Ningún medio de pago está configurado todavía. Definí{" "}
              <code className="text-fg">MP_ACCESS_TOKEN</code> (Mercado Pago) o{" "}
              <code className="text-fg">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> (PayPal)
              en tu <code className="text-fg">.env</code>.
            </div>
          ) : (
            <div className={formValid ? "" : "pointer-events-none opacity-50"}>
              {/* Selector de método (si hay más de uno) */}
              {MP_ENABLED && PAYPAL_CLIENT_ID && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <MethodTab
                    active={method === "mp"}
                    onClick={() => setMethod("mp")}
                    label="Mercado Pago"
                    hint="Tarjetas y cuotas"
                  />
                  <MethodTab
                    active={method === "paypal"}
                    onClick={() => setMethod("paypal")}
                    label="PayPal"
                    hint="Tarjeta internacional"
                  />
                </div>
              )}

              {/* Mercado Pago (Checkout Pro) */}
              {method === "mp" && MP_ENABLED && (
                <Button
                  size="lg"
                  className="w-full"
                  loading={mpLoading}
                  disabled={!formValid}
                  onClick={payWithMP}
                >
                  Pagar con Mercado Pago
                </Button>
              )}

              {/* PayPal */}
              {method === "paypal" && PAYPAL_CLIENT_ID && (
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
                            phone: phoneFull,
                            address: {
                              line1: form.address,
                              city: form.city,
                              zip: form.zip,
                              country: country.name,
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
              )}
            </div>
          )}

          {/* Confianza */}
          <div className="mt-6 flex items-center gap-2 text-xs text-muted">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
            Pago cifrado. No guardamos los datos de tu tarjeta.
          </div>
        </div>
      </motion.div>

      {/* Resumen */}
      <motion.aside
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="order-1 h-fit rounded-brand border border-border bg-card p-6 md:order-2 md:sticky md:top-28"
      >
        <h2 className="font-heading text-xl">Tu pedido</h2>
        <ul className="mt-6 space-y-4">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-3 text-sm">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-brand bg-fg/5">
                {i.imageUrl && (
                  <Image
                    src={i.imageUrl}
                    alt={i.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{i.name}</p>
                <p className="text-xs text-muted">
                  {i.quantity} u.
                  {i.variantName ? ` · ${i.variantName}` : ""}
                </p>
              </div>
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

        <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs text-muted">
          <p className="flex flex-wrap items-center gap-2">
            <Truck className="h-4 w-4" strokeWidth={1.5} /> Envío con seguimiento
            por
            <Image
              src={withBasePath("/dhl.png")}
              alt="DHL"
              width={64}
              height={14}
              className="h-3.5 w-auto rounded-[2px]"
            />
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.5} /> Compra protegida
            con PayPal.
          </p>
        </div>
      </motion.aside>
    </div>
  );
}

/** Paso del indicador de progreso del checkout. */
function Step({
  n,
  label,
  done,
  active,
}: {
  n: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
          done
            ? "bg-primary text-primary-fg"
            : active
              ? "border border-primary text-primary"
              : "border border-border text-muted",
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      <span
        className={cn(
          "transition-colors",
          active || done ? "text-fg" : "text-muted",
        )}
      >
        {label}
      </span>
    </li>
  );
}

/** Botón de selección de medio de pago. */
function MethodTab({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-brand border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-fg/30",
      )}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted">{hint}</p>
    </button>
  );
}
