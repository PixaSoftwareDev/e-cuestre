/**
 * Utilidades de dinero. Internamente TODO se maneja en centavos (enteros)
 * para evitar errores de punto flotante. Solo se convierte a decimal al mostrar.
 */

export function formatMoney(
  cents: number,
  currency = "USD",
  locale = "es-AR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Convierte un valor decimal (ej. 199.99) a centavos (19999). */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Convierte centavos a un string decimal "199.99" para APIs (PayPal). */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}
