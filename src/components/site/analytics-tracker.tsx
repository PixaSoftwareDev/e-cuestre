"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSessionId, track } from "@/lib/track";

/**
 * Monta la analítica del sitio:
 *  - registra page_view en cada cambio de ruta
 *  - inicia la grabación de sesión (rrweb) si está habilitada
 *
 * La grabación se carga de forma diferida para no afectar el rendimiento inicial.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const startedRef = useRef(false);

  // page_view en cada navegación
  useEffect(() => {
    track({ type: "page_view", path: pathname });
  }, [pathname]);

  // grabación de sesión (una sola vez)
  useEffect(() => {
    if (startedRef.current) return;
    if (process.env.NEXT_PUBLIC_SESSION_RECORDING !== "true") return;
    startedRef.current = true;

    let stop: (() => void) | undefined;
    const sessionId = getSessionId();
    const startedAt = Date.now();

    (async () => {
      const { record } = await import("rrweb");
      let buffer: unknown[] = [];
      let seq = 0;

      const flush = () => {
        if (!buffer.length) return;
        const events = buffer;
        buffer = [];
        const payload = JSON.stringify({
          sessionId,
          seq: seq++,
          events,
          duration: Date.now() - startedAt,
          device:
            window.innerWidth < 640
              ? "mobile"
              : window.innerWidth < 1024
                ? "tablet"
                : "desktop",
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/recordings", payload);
        } else {
          fetch("/api/recordings", {
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" },
            keepalive: true,
          }).catch(() => {});
        }
      };

      const stopFn = record({
        emit(event) {
          buffer.push(event);
        },
        // Enmascara inputs sensibles por defecto (privacidad).
        maskAllInputs: true,
        recordCanvas: false,
      });

      const interval = window.setInterval(flush, 5000);
      const onHide = () => flush();
      document.addEventListener("visibilitychange", onHide);
      window.addEventListener("pagehide", onHide);

      stop = () => {
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onHide);
        window.removeEventListener("pagehide", onHide);
        flush();
        stopFn?.();
      };
    })();

    return () => stop?.();
  }, []);

  return null;
}
