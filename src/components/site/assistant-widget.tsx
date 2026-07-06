"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MessagesSquare, X, Send, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useSearch } from "@/store/search";

type Suggestion = {
  name: string;
  slug: string;
  image: string | null;
  price: number;
  currency: string;
};
type Msg = { role: "user" | "assistant"; content: string; suggestions?: Suggestion[] };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "¡Hola! Soy tu asesor de estilo. Contame qué buscás y te ayudo a elegir la pieza justa.",
};

/** Convierte **negritas** en <strong> dentro de una línea. */
function renderInline(text: string, key: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith("**") && seg.endsWith("**") && seg.length > 4 ? (
      <strong key={`${key}-${i}`}>{seg.slice(2, -2)}</strong>
    ) : (
      <span key={`${key}-${i}`}>{seg}</span>
    ),
  );
}

/** Renderiza el texto del asistente respetando saltos de línea, viñetas y negritas. */
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.trim() === "") return null;
        const isBullet = /^\s*[-*•]\s+/.test(line);
        if (isBullet) {
          const content = line.replace(/^\s*[-*•]\s+/, "");
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-[3px] text-accent">•</span>
              <span>{renderInline(content, `l${i}`)}</span>
            </div>
          );
        }
        return <p key={i}>{renderInline(line, `l${i}`)}</p>;
      })}
    </div>
  );
}

export function AssistantWidget() {
  const router = useRouter();
  const cartOpen = useCart((s) => s.isOpen);
  const searchOpen = useSearch((s) => s.open);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((_, i) => i !== 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ?? data.error ?? "Disculpá, no pude responder. Probá de nuevo.",
          suggestions: data.suggestions ?? [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "No pude conectar. Probá de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openProduct(slug: string) {
    setOpen(false);
    router.push(`/producto/${slug}`);
  }

  // Se oculta mientras el carrito o la búsqueda están abiertos (para no pisarse).
  const hidden = cartOpen || searchOpen;

  return (
    <>
      {/* Burbuja flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Asesor de estilo"
        className={cn(
          "group fixed bottom-5 right-5 z-[65] inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-fg shadow-[var(--shadow-lift)] transition-all hover:-translate-y-0.5 active:scale-95",
          hidden && "pointer-events-none scale-0 opacity-0",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            {open ? (
              <X className="h-6 w-6" strokeWidth={1.75} />
            ) : (
              <MessagesSquare className="h-6 w-6" strokeWidth={1.6} />
            )}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && !hidden && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-[66] flex h-[70vh] max-h-[580px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[var(--shadow-lift)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-fg">
                  <MessagesSquare className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>
                <div>
                  <p className="text-sm font-medium leading-tight">
                    Asesor de estilo
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> En
                    línea
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="nav-icon inline-flex h-9 w-9 items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className="space-y-2">
                  <div
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-fg"
                          : "rounded-bl-sm bg-fg/5 text-fg",
                      )}
                    >
                      {m.role === "assistant" ? (
                        <RichText text={m.content} />
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>

                  {/* Sugerencias clicables */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="space-y-2">
                      {m.suggestions.map((s) => (
                        <button
                          key={s.slug}
                          onClick={() => openProduct(s.slug)}
                          className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:border-fg/30"
                        >
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-fg/5">
                            {s.image && (
                              <Image
                                src={s.image}
                                alt={s.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{s.name}</p>
                            <p className="text-xs tabular-nums text-muted">
                              {formatMoney(s.price, s.currency)}
                            </p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl bg-fg/5 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu consulta…"
                className="h-11 w-full rounded-full border border-fg/15 bg-card px-4 text-sm outline-none transition-colors focus-visible:border-primary"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Enviar"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              >
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
