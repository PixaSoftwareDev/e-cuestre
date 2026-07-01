import { prisma } from "@/lib/prisma";

export type TrackEvent = {
  type:
    | "page_view"
    | "product_view"
    | "add_to_cart"
    | "begin_checkout"
    | "purchase"
    | "search";
  sessionId: string;
  path?: string;
  productId?: string;
  brandId?: string;
  value?: number;
  quantity?: number;
  metadata?: Record<string, unknown>;
  referrer?: string;
  device?: string;
};

/** Persiste una tanda de eventos de analítica. Nunca lanza (best-effort). */
export async function recordEvents(events: TrackEvent[]): Promise<void> {
  if (!events.length) return;
  try {
    await prisma.analyticsEvent.createMany({
      data: events.map((e) => ({
        type: e.type,
        sessionId: e.sessionId,
        path: e.path,
        productId: e.productId,
        brandId: e.brandId,
        value: e.value,
        quantity: e.quantity,
        metadata: e.metadata as object | undefined,
        referrer: e.referrer,
        device: e.device,
      })),
    });
  } catch (err) {
    console.error("[analytics] error al registrar eventos", err);
  }
}
