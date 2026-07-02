"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { createReview } from "@/app/(site)/producto/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ReviewForm({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({
    authorName: "",
    email: "",
    title: "",
    comment: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) return setError("Elegí una puntuación.");
    if (form.authorName.trim().length < 2) return setError("Ingresá tu nombre.");
    if (!/.+@.+\..+/.test(form.email)) return setError("Ingresá un email válido.");
    setSending(true);
    try {
      await createReview({ productId, slug, rating, ...form });
      setDone(true);
    } catch {
      setError("No se pudo enviar. Probá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-brand border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
        <Check className="h-4 w-4" strokeWidth={2} />
        ¡Gracias! Tu reseña quedó pendiente de aprobación.
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Escribir reseña
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-brand border border-border bg-card p-5"
    >
      <div>
        <Label>Tu puntuación *</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-7 w-7",
                  i <= (hover || rating)
                    ? "fill-accent text-accent"
                    : "fill-transparent text-fg/25",
                )}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rv-name">Nombre *</Label>
          <Input id="rv-name" value={form.authorName} onChange={set("authorName")} />
        </div>
        <div>
          <Label htmlFor="rv-email">Email *</Label>
          <Input id="rv-email" type="email" value={form.email} onChange={set("email")} />
        </div>
      </div>
      <div>
        <Label htmlFor="rv-title">Título (opcional)</Label>
        <Input id="rv-title" value={form.title} onChange={set("title")} />
      </div>
      <div>
        <Label htmlFor="rv-comment">Tu opinión (opcional)</Label>
        <Textarea id="rv-comment" value={form.comment} onChange={set("comment")} />
      </div>

      {error && (
        <p className="rounded-brand bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      <p className="text-xs text-muted">
        Tu reseña se publicará luego de ser aprobada.
      </p>
      <div className="flex gap-2">
        <Button type="submit" loading={sending}>
          Enviar reseña
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
