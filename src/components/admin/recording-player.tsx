"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import "rrweb/dist/style.css";

type Ctrl = {
  play: (t?: number) => void;
  pause: () => void;
  getCurrentTime: () => number;
  destroy?: () => void;
};

/**
 * Reproductor de grabaciones rrweb. Usa el `Replayer` de rrweb directamente
 * (más estable en Next que rrweb-player) con controles propios. La sesión se
 * reproduce a la resolución original y se ESCALA para entrar completa a lo
 * ancho del contenedor (sin scroll lateral).
 */
export function RecordingPlayer({ events }: { events: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<Ctrl | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  // Escala el reproductor para que su ancho entre en el contenedor.
  const fit = useCallback(() => {
    const container = ref.current;
    const wrapper = container?.querySelector<HTMLElement>(".replayer-wrapper");
    const iframe = wrapper?.querySelector("iframe");
    if (!container || !wrapper || !iframe) return;
    // El tamaño real de la sesión es el del iframe (el viewport grabado).
    const recW =
      iframe.offsetWidth || parseFloat(iframe.getAttribute("width") || "0");
    const recH =
      iframe.offsetHeight || parseFloat(iframe.getAttribute("height") || "0");
    if (!recW || !recH) return;
    // Se fija ese tamaño en el wrapper y se lo escala para entrar completo.
    wrapper.style.width = `${recW}px`;
    wrapper.style.height = `${recH}px`;
    const scale = Math.min(container.clientWidth / recW, 1);
    wrapper.style.transformOrigin = "top left";
    wrapper.style.transform = `scale(${scale})`;
    // El contenedor toma el alto de la sesión ya escalada (sin huecos).
    container.style.height = `${recH * scale}px`;
  }, []);

  useEffect(() => {
    if (!ref.current || events.length < 2) return;
    const container = ref.current;
    let cancelled = false;
    let raf = 0;

    (async () => {
      try {
        const { Replayer } = await import("rrweb");
        if (cancelled) return;
        container.innerHTML = "";
        const replayer = new Replayer(events as never, {
          root: container,
          skipInactive: true,
          showWarning: false,
          mouseTail: false,
        }) as unknown as Ctrl;
        replayerRef.current = replayer;
        replayer.play();
        setPlaying(true);
        // El wrapper puede tardar un frame en tener dimensiones: reintenta.
        let tries = 0;
        const tick = () => {
          fit();
          if (++tries < 8) raf = window.setTimeout(tick, 120);
        };
        tick();
      } catch {
        setError(true);
      }
    })();

    const onResize = () => fit();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.clearTimeout(raf);
      window.removeEventListener("resize", onResize);
      replayerRef.current?.destroy?.();
      replayerRef.current = null;
      container.innerHTML = "";
      container.style.height = "";
    };
  }, [events, fit]);

  if (events.length < 2) {
    return (
      <p className="rounded-brand border border-dashed border-border p-8 text-center text-sm text-muted">
        Esta sesión no tiene suficientes eventos para reproducir.
      </p>
    );
  }
  if (error) {
    return (
      <p className="rounded-brand border border-dashed border-border p-8 text-center text-sm text-muted">
        No se pudo cargar el reproductor.
      </p>
    );
  }

  const toggle = () => {
    const r = replayerRef.current;
    if (!r) return;
    if (playing) {
      r.pause();
      setPlaying(false);
    } else {
      r.play(r.getCurrentTime());
      setPlaying(true);
    }
  };
  const restart = () => {
    replayerRef.current?.play(0);
    setPlaying(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={toggle}
          className="inline-flex items-center gap-2 rounded-brand bg-primary px-4 py-2 text-sm text-primary-fg transition-opacity hover:opacity-90"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pausar" : "Reproducir"}
        </button>
        <button
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-brand border border-border px-4 py-2 text-sm transition-colors hover:bg-fg/5"
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
      {/* overflow-hidden: la sesión se escala para entrar completa, sin scroll */}
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-brand border border-border bg-white"
      />
    </div>
  );
}
