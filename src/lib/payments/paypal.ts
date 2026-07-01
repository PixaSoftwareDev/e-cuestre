import "server-only";
import { centsToDecimalString } from "@/lib/money";
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  CapturePaymentResult,
} from "./provider";

const PAYPAL_API: Record<string, string> = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

function baseUrl(): string {
  const env = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
  return PAYPAL_API[env];
}

async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "Faltan PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET en las variables de entorno.",
    );
  }
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`PayPal auth falló: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export class PayPalProvider implements PaymentProvider {
  readonly id = "paypal";

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    const token = await getAccessToken();
    const total = centsToDecimalString(input.amount);

    const res = await fetch(`${baseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.orderId,
            custom_id: input.orderId,
            invoice_id: input.orderNumber,
            amount: {
              currency_code: input.currency,
              value: total,
              breakdown: {
                item_total: {
                  currency_code: input.currency,
                  value: total,
                },
              },
            },
            items: input.items.map((it) => ({
              name: it.name.slice(0, 127),
              quantity: String(it.quantity),
              unit_amount: {
                currency_code: input.currency,
                value: centsToDecimalString(it.unitPrice),
              },
            })),
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(
        `PayPal createOrder falló: ${res.status} ${await res.text()}`,
      );
    }
    const data = (await res.json()) as { id: string };
    return { providerOrderId: data.id };
  }

  async capturePayment(
    providerOrderId: string,
  ): Promise<CapturePaymentResult> {
    const token = await getAccessToken();
    const res = await fetch(
      `${baseUrl()}/v2/checkout/orders/${providerOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return { status: "failed", raw: data };
    }

    const capture =
      data?.purchase_units?.[0]?.payments?.captures?.[0] ?? undefined;
    const completed = data?.status === "COMPLETED";
    const amountValue = capture?.amount?.value
      ? Math.round(parseFloat(capture.amount.value) * 100)
      : undefined;

    return {
      status: completed ? "completed" : "pending",
      captureId: capture?.id,
      amount: amountValue,
      currency: capture?.amount?.currency_code,
      raw: data,
    };
  }
}
