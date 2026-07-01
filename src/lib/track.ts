"use client";

import type { TrackEvent } from "@/lib/analytics";

const SESSION_KEY = "ecuestre_sid";

/** Id de sesión estable por pestaña (persistente en la sesión del navegador). */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function detectDevice(): string {
  if (typeof window === "undefined") return "server";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/** Envía un evento de analítica (best-effort, no bloqueante). */
export function track(
  event: Omit<TrackEvent, "sessionId" | "device"> &
    Partial<Pick<TrackEvent, "sessionId" | "device">>,
) {
  if (typeof window === "undefined") return;
  const payload: TrackEvent = {
    ...event,
    sessionId: event.sessionId ?? getSessionId(),
    device: event.device ?? detectDevice(),
    referrer: event.referrer ?? (document.referrer || undefined),
    path: event.path ?? window.location.pathname,
  };
  const body = JSON.stringify({ events: [payload] });
  // sendBeacon sobrevive a la navegación; fetch como fallback.
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", body);
  } else {
    fetch("/api/analytics", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }
}
