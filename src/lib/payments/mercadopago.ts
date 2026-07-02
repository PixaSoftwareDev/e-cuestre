import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * Integración con Mercado Pago (Checkout Pro).
 * Flujo: creamos una "preferencia" con los items → el cliente paga en MP →
 * vuelve a nuestra back_url, donde verificamos el pago y finalizamos la orden.
 */

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function isMercadoPagoConfigured(): boolean {
  return Boolean(ACCESS_TOKEN);
}

function client() {
  if (!ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN no configurado.");
  return new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
}

export type MpItem = {
  name: string;
  quantity: number;
  /** precio unitario en centavos */
  unitPrice: number;
};

/** Crea la preferencia y devuelve la URL a la que redirigir al cliente. */
export async function createPreference(input: {
  orderId: string;
  orderNumber: string;
  currency: string;
  items: MpItem[];
}): Promise<{ initPoint: string; preferenceId: string }> {
  const pref = new Preference(client());
  const res = await pref.create({
    body: {
      items: input.items.map((i, idx) => ({
        id: `${input.orderId}-${idx}`,
        title: i.name,
        quantity: i.quantity,
        unit_price: i.unitPrice / 100, // MP usa la unidad monetaria, no centavos
        currency_id: input.currency,
      })),
      external_reference: input.orderId,
      statement_descriptor: "ECUESTRE",
      back_urls: {
        success: `${SITE_URL}/api/checkout/mp/return`,
        failure: `${SITE_URL}/api/checkout/mp/return`,
        pending: `${SITE_URL}/api/checkout/mp/return`,
      },
      auto_return: "approved",
      notification_url: `${SITE_URL}/api/checkout/mp/webhook`,
      metadata: { order_number: input.orderNumber },
    },
  });

  const initPoint = res.init_point ?? res.sandbox_init_point;
  if (!initPoint) throw new Error("Mercado Pago no devolvió el link de pago.");
  return { initPoint, preferenceId: res.id ?? "" };
}

/** Consulta el estado de un pago por su id. */
export async function getPayment(paymentId: string): Promise<{
  status: "approved" | "pending" | "rejected" | "other";
  amount: number; // en centavos
  currency?: string;
  orderId?: string;
}> {
  const payment = new Payment(client());
  const p = await payment.get({ id: paymentId });
  const status =
    p.status === "approved"
      ? "approved"
      : p.status === "pending" || p.status === "in_process"
        ? "pending"
        : p.status === "rejected"
          ? "rejected"
          : "other";
  return {
    status,
    amount: Math.round((p.transaction_amount ?? 0) * 100),
    currency: p.currency_id,
    orderId: p.external_reference ?? undefined,
  };
}
