import "server-only";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { recordEvents } from "@/lib/analytics";

export type CartLineInput = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CustomerInput = {
  email: string;
  name?: string;
  phone?: string;
  address?: Record<string, unknown>;
};

/**
 * Crea una orden PENDING a partir del carrito.
 * Los precios y el stock SIEMPRE se validan contra la base: nunca se confía
 * en los montos que envía el cliente.
 */
export async function createOrderFromCart(
  lines: CartLineInput[],
  customer: CustomerInput,
) {
  if (!lines.length) throw new Error("El carrito está vacío.");

  // Traemos las variantes reales con su producto.
  const variantIds = lines.map((l) => l.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
  });

  const items = lines.map((line) => {
    const variant = variants.find((v) => v.id === line.variantId);
    if (!variant || variant.productId !== line.productId) {
      throw new Error("Un producto del carrito ya no está disponible.");
    }
    const qty = Math.max(1, Math.floor(line.quantity));
    if (qty > variant.stock) {
      throw new Error(
        `Sin stock suficiente de "${variant.product.name}" (${variant.name}). Disponibles: ${variant.stock}.`,
      );
    }
    const unitPrice = variant.price ?? variant.product.basePrice;
    return {
      productId: variant.productId,
      variantId: variant.id,
      name: variant.product.name,
      variantName: variant.name,
      imageUrl: variant.product.images[0]?.url,
      unitPrice,
      quantity: qty,
      lineTotal: unitPrice * qty,
      currency: variant.product.currency,
    };
  });

  const currency = items[0]?.currency ?? "USD";
  const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
  const shipping = 0; // envío gratis por ahora (configurable)
  const tax = 0;
  const total = subtotal + shipping + tax;

  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      email: customer.email,
      customerName: customer.name,
      phone: customer.phone,
      status: "PENDING",
      subtotal,
      shipping,
      tax,
      total,
      currency,
      paymentProvider: "paypal",
      shippingAddress: customer.address as object | undefined,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          variantName: i.variantName,
          imageUrl: i.imageUrl,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
        })),
      },
    },
    include: { items: true },
  });

  return order;
}

/**
 * Marca la orden como pagada y descuenta stock de forma transaccional.
 * Idempotente: si la orden ya está PAID, no vuelve a descontar.
 */
export async function finalizePaidOrder(
  orderId: string,
  payment: { captureId?: string },
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error("Orden inexistente.");
    if (order.status === "PAID" || order.status === "FULFILLED") {
      return order; // ya procesada
    }

    // Descontar stock por variante.
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentRef: payment.captureId ?? order.paymentRef,
      },
      include: { items: true },
    });
    return updated;
  }).then(async (order) => {
    // Analítica de compra (fuera de la transacción).
    await recordEvents([
      {
        type: "purchase",
        sessionId: `order:${order.id}`,
        value: order.total,
        quantity: order.items.reduce((n, i) => n + i.quantity, 0),
        metadata: { orderNumber: order.number },
      },
    ]);
    return order;
  });
}
