import "server-only";
import type { PaymentProvider } from "./provider";
import { PayPalProvider } from "./paypal";

/**
 * Devuelve el proveedor de pago activo. Cambiar de proveedor (o soportar
 * varios) se hace acá, sin tocar el resto de la app.
 */
export function getPaymentProvider(): PaymentProvider {
  // En el futuro: switch por env PAYMENT_PROVIDER -> paypal | payway | stripe
  return new PayPalProvider();
}

export type { PaymentProvider } from "./provider";
