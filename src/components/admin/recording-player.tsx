"use client";

import { useEffect, useRef, useState } from "react";
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
 * (más estable en Next que el wrapper rrweb-player) con controles propios.
 * Recibe los eventos ya concatenados y ordenados por `seq`.
 */
export function RecordingPlayer({ events }: { events: unknown[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<Ctrl | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref.current || events.length < 2) return;
    const container = ref.current;
    let cancelled = false;

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
      } catch {
        setError(true);
      }
    })();

    return () => {
      cancelled = true;
      replayerRef.current?.destroy?.();
      replayerRef.current = null;
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
      <div
        ref={ref}
        className="grid min-h-[400px] place-items-center overflow-auto rounded-brand border border-border bg-white p-2"
      />
    </div>
  );
}
