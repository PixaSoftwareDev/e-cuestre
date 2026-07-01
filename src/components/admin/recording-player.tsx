"use client";

import { useEffect, useRef } from "react";

/**
 * Reproductor de grabaciones rrweb. Recibe los eventos ya concatenados
 * (ordenados por seq) y monta el player al vuelo.
 */
export function RecordingPlayer({ events }: { events: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || events.length < 2) return;
    const container = ref.current;
    let player: { $destroy?: () => void } | undefined;

    (async () => {
      const [{ default: rrwebPlayer }] = await Promise.all([
        import("rrweb-player"),
        import("rrweb-player/dist/style.css"),
      ]);
      container.innerHTML = "";
      player = new rrwebPlayer({
        target: container,
        props: {
          events: events as never,
          autoPlay: false,
          showController: true,
          width: container.clientWidth || 900,
        },
      }) as unknown as { $destroy?: () => void };
    })();

    return () => {
      player?.$destroy?.();
      container.innerHTML = "";
    };
  }, [events]);

  if (events.length < 2) {
    return (
      <p className="rounded-brand border border-dashed border-border p-8 text-center text-sm text-muted">
        Esta sesión no tiene suficientes eventos para reproducir.
      </p>
    );
  }

  return <div ref={ref} className="overflow-hidden rounded-brand border border-border" />;
}
