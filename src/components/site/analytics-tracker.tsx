"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";
import { withBasePath } from "@/lib/base-path";

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
    // Acepta "true"/"on"/"1"/"yes" (tolerante a cómo se setee el flag).
    const flag = (process.env.NEXT_PUBLIC_SESSION_RECORDING ?? "").toLowerCase();
    if (!["true", "on", "1", "yes"].includes(flag)) return;
    startedRef.current = true;

    let stop: (() => void) | undefined;
    // ID propio por sesión de grabación: cada carga de la app arranca su
    // propia grabación con su snapshot inicial (seq 0), evitando que se pisen
    // chunks al recargar la página. crypto.randomUUID solo existe en contextos
    // seguros (HTTPS/localhost); en HTTP se cae a un id aleatorio simple.
    const sessionId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const startedAt = Date.now();

    (async () => {
      const { record } = await import("rrweb");
      let buffer: unknown[] = [];
      let seq = 0;
      const endpoint = withBasePath("/api/recordings");

      const flush = (isUnload = false) => {
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
        // sendBeacon y fetch-keepalive comparten un límite de ~64KB de body; el
        // primer chunk (con el snapshot) suele superarlo. Para payloads chicos
        // usamos sendBeacon; para el resto, fetch SIN keepalive (sin límite de
        // tamaño). keepalive solo se activa al descargar la página, donde es la
        // única forma de que el request sobreviva (y ahí el chunk ya es chico).
        if (
          payload.length < 60_000 &&
          typeof navigator.sendBeacon === "function" &&
          navigator.sendBeacon(endpoint, payload)
        ) {
          return;
        }
        fetch(endpoint, {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/json" },
          keepalive: isUnload && payload.length < 60_000,
        }).catch(() => {});
      };

      const stopFn = record({
        emit(event) {
          buffer.push(event);
        },
        // Enmascara inputs sensibles por defecto (privacidad).
        maskAllInputs: true,
        recordCanvas: false,
      });

      const interval = window.setInterval(() => flush(), 5000);
      const onHide = () => flush(true);
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
