/**
 * Abstracción de proveedor de pago.
 *
 * Toda la app habla contra esta interfaz. Hoy la implementa PayPal; mañana
 * se puede sumar Payway, Mercado Pago o Stripe sin tocar el checkout ni las
 * órdenes: basta con crear otra clase que implemente `PaymentProvider` y
 * elegirla en `getPaymentProvider()`.
 */

export type PaymentLineItem = {
  name: string;
  quantity: number;
  /** precio unitario en centavos */
  unitPrice: number;
};

export type CreatePaymentInput = {
  /** id de la orden interna (nuestro Order.id) */
  orderId: string;
  /** número legible de orden */
  orderNumber: string;
  currency: string;
  /** total en centavos */
  amount: number;
  items: PaymentLineItem[];
};

export type CreatePaymentResult = {
  /** id de la orden del proveedor (ej. PayPal order id) */
  providerOrderId: string;
};

export type CapturePaymentResult = {
  /** estado normalizado */
  status: "completed" | "pending" | "failed";
  /** id de la captura/transacción del proveedor */
  captureId?: string;
  /** monto capturado en centavos (para verificación) */
  amount?: number;
  currency?: string;
  raw?: unknown;
};

export interface PaymentProvider {
  readonly id: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  capturePayment(providerOrderId: string): Promise<CapturePaymentResult>;
}
