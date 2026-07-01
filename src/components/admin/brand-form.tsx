"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  themeToCssVars,
  type BrandTheme,
} from "@/lib/theme";
import { saveBrand, deleteBrand, type BrandInput } from "@/app/admin/marcas/actions";

export type BrandFormInitial = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImageUrl: string;
  active: boolean;
  sortOrder: number;
  theme: BrandTheme;
};

const COLOR_LABELS: { key: keyof BrandTheme["colors"]; label: string }[] = [
  { key: "primary", label: "Primario" },
  { key: "primaryFg", label: "Texto s/ primario" },
  { key: "accent", label: "Acento" },
  { key: "bg", label: "Fondo" },
  { key: "fg", label: "Texto" },
  { key: "card", label: "Tarjetas" },
  { key: "muted", label: "Atenuado" },
  { key: "border", label: "Bordes" },
];

export function BrandForm({ initial }: { initial?: BrandFormInitial }) {
  const router = useRouter();
  const [f, setF] = useState<BrandFormInitial>(
    initial ?? {
      name: "",
      slug: "",
      tagline: "",
      description: "",
      heroImageUrl: "",
      active: true,
      sortOrder: 0,
      theme: DEFAULT_THEME,
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  const setColor = (key: keyof BrandTheme["colors"], value: string) =>
    setF((s) => ({
      ...s,
      theme: { ...s.theme, colors: { ...s.theme.colors, [key]: value } },
    }));

  async function upload(file?: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setF((s) => ({ ...s, heroImageUrl: data.url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    setError(null);
    if (!f.name.trim()) return setError("El nombre es obligatorio.");
    const payload: BrandInput = {
      id: f.id,
      name: f.name.trim(),
      slug: f.slug.trim() || undefined,
      tagline: f.tagline.trim() || undefined,
      description: f.description.trim() || undefined,
      heroImageUrl: f.heroImageUrl.trim() || undefined,
      active: f.active,
      sortOrder: Number(f.sortOrder) || 0,
      theme: f.theme,
    };
    start(async () => {
      try {
        await saveBrand(payload);
        router.push("/admin/marcas");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  function remove() {
    if (!f.id) return;
    if (!confirm("¿Eliminar esta marca y todos sus productos?")) return;
    start(async () => {
      await deleteBrand(f.id!);
      router.push("/admin/marcas");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-brand border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg">Datos de la marca</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="auto" />
              </div>
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
            </div>
            <div>
              <Label>Imagen de portada (hero)</Label>
              <div className="flex items-center gap-3">
                <Input
                  value={f.heroImageUrl}
                  onChange={(e) => setF({ ...f, heroImageUrl: e.target.value })}
                  placeholder="URL o subí una imagen"
                />
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-brand border border-border px-3 py-2.5 text-xs hover:border-fg/30">
                  <Upload className="h-4 w-4" />
                  {uploading ? "…" : "Subir"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-brand border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg">Identidad visual (theme)</h2>
            <Select
              className="h-9 w-56 text-xs"
              onChange={(e) => {
                const preset = THEME_PRESETS[e.target.value];
                if (preset) setF((s) => ({ ...s, theme: preset.theme }));
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Aplicar preset…
              </option>
              {Object.entries(THEME_PRESETS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {COLOR_LABELS.map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={f.theme.colors[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
                  />
                  <Input
                    value={f.theme.colors[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 max-w-xs">
            <Label className="text-xs">Radio de esquinas</Label>
            <Select
              value={f.theme.radius}
              onChange={(e) => setF((s) => ({ ...s, theme: { ...s.theme, radius: e.target.value } }))}
            >
              <option value="0rem">Recto (0)</option>
              <option value="0.25rem">Sutil (4px)</option>
              <option value="0.5rem">Medio (8px)</option>
              <option value="1rem">Redondeado (16px)</option>
            </Select>
          </div>
        </section>
      </div>

      {/* Lateral: preview + publicación */}
      <div className="space-y-6">
        <section className="rounded-brand border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg">Vista previa</h2>
          <div
            style={themeToCssVars(f.theme) as React.CSSProperties}
            className="overflow-hidden rounded-[var(--radius-brand)] border"
          >
            <div className="bg-[var(--color-bg)] p-5 text-[var(--color-fg)]">
              <p className="text-xs" style={{ letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                {f.name || "Marca"}
              </p>
              <h3 className="mt-1 font-heading text-xl">Pieza destacada</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                {f.tagline || "Tu tagline acá"}
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-[var(--radius-brand)] bg-[var(--color-primary)] px-4 py-2 text-xs" style={{ color: "var(--color-primary-fg)" }}>
                  Comprar
                </span>
                <span className="rounded-[var(--radius-brand)] border px-4 py-2 text-xs">
                  Ver más
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-brand border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg">Publicación</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="h-4 w-4" />
              Marca activa (visible)
            </label>
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={f.sortOrder}
                onChange={(e) => setF({ ...f, sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
        </section>

        {f.heroImageUrl && (
          <div className="relative aspect-video overflow-hidden rounded-brand border border-border">
            <Image src={f.heroImageUrl} alt="" fill sizes="320px" className="object-cover" />
          </div>
        )}

        {error && (
          <p className="rounded-brand bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={submit} disabled={pending || uploading} size="lg">
            {pending ? "Guardando…" : "Guardar marca"}
          </Button>
          {f.id && (
            <Button variant="ghost" onClick={remove} disabled={pending}>
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
