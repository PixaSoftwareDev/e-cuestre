"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { toCents } from "@/lib/money";
import { saveProduct, deleteProduct } from "@/app/admin/productos/actions";

type BrandOpt = { id: string; name: string };
type FormImage = { url: string; alt?: string };
type FormVariant = {
  id?: string;
  name: string;
  sku: string;
  price: string; // decimal, vacío = usa precio base
  stock: string;
};

export type ProductFormInitial = {
  id?: string;
  name: string;
  slug: string;
  brandId: string;
  categoryName: string;
  description: string;
  story: string;
  material: string;
  basePrice: string; // decimal
  compareAtPrice: string; // decimal
  currency: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  tags: string; // coma separada
  images: FormImage[];
  variants: FormVariant[];
};

const empty: ProductFormInitial = {
  name: "",
  slug: "",
  brandId: "",
  categoryName: "",
  description: "",
  story: "",
  material: "",
  basePrice: "",
  compareAtPrice: "",
  currency: "USD",
  status: "DRAFT",
  featured: false,
  tags: "",
  images: [],
  variants: [{ name: "Único", sku: "", price: "", stock: "0" }],
};

export function ProductForm({
  brands,
  initial,
}: {
  brands: BrandOpt[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [f, setF] = useState<ProductFormInitial>(
    initial ?? { ...empty, brandId: brands[0]?.id ?? "" },
  );
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductFormInitial>(
    k: K,
    v: ProductFormInitial[K],
  ) => setF((s) => ({ ...s, [k]: v }));

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: FormImage[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al subir");
        uploaded.push({ url: data.url });
      }
      set("images", [...f.images, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function addImageUrl() {
    const url = prompt("URL de la imagen:");
    if (url) set("images", [...f.images, { url }]);
  }

  function submit() {
    setError(null);
    if (!f.name.trim()) return setError("El nombre es obligatorio.");
    if (!f.brandId) return setError("Elegí una marca.");
    if (!f.basePrice || isNaN(Number(f.basePrice)))
      return setError("Ingresá un precio base válido.");
    if (f.variants.length === 0) return setError("Agregá al menos una variante.");

    const payload = {
      id: f.id,
      name: f.name.trim(),
      slug: f.slug.trim() || undefined,
      brandId: f.brandId,
      categoryName: f.categoryName.trim() || undefined,
      description: f.description.trim() || undefined,
      story: f.story.trim() || undefined,
      material: f.material.trim() || undefined,
      basePrice: toCents(Number(f.basePrice)),
      compareAtPrice: f.compareAtPrice ? toCents(Number(f.compareAtPrice)) : null,
      currency: f.currency,
      status: f.status,
      featured: f.featured,
      tags: f.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      images: f.images,
      variants: f.variants.map((v) => ({
        id: v.id,
        name: v.name.trim(),
        sku: v.sku.trim() || undefined,
        price: v.price ? toCents(Number(v.price)) : null,
        stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
      })),
    };

    startTransition(async () => {
      try {
        await saveProduct(payload);
        router.push("/admin/productos");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  function handleDelete() {
    if (!f.id) return;
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer."))
      return;
    startTransition(async () => {
      await deleteProduct(f.id!);
      router.push("/admin/productos");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Columna principal */}
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-brand border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg">Información</h2>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={f.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={f.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="se genera del nombre si lo dejás vacío"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={f.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div>
              <Label>Historia / detalle (opcional)</Label>
              <Textarea
                value={f.story}
                onChange={(e) => set("story", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material</Label>
                <Input
                  value={f.material}
                  onChange={(e) => set("material", e.target.value)}
                />
              </div>
              <div>
                <Label>Etiquetas (coma)</Label>
                <Input
                  value={f.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="cuero, polo, cinto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Imágenes */}
        <section className="rounded-brand border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg">Imágenes</h2>
            <div className="flex gap-2">
              <Button type="button" variant="subtle" size="sm" onClick={addImageUrl}>
                Pegar URL
              </Button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-brand border border-border bg-card px-4 py-2 text-xs hover:border-fg/30">
                <Upload className="h-4 w-4" />
                {uploading ? "Subiendo…" : "Subir"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
            </div>
          </div>
          {f.images.length === 0 ? (
            <p className="text-sm text-muted">Sin imágenes todavía.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {f.images.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-brand bg-fg/5">
                  <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      set("images", f.images.filter((_, j) => j !== i))
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Quitar imagen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-fg">
                      Portada
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Variantes */}
        <section className="rounded-brand border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg">Variantes y stock</h2>
            <Button
              type="button"
              variant="subtle"
              size="sm"
              onClick={() =>
                set("variants", [
                  ...f.variants,
                  { name: "", sku: "", price: "", stock: "0" },
                ])
              }
            >
              <Plus className="h-4 w-4" /> Variante
            </Button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_100px_80px_32px] gap-2 text-xs text-muted">
              <span>Nombre (talle/color)</span>
              <span>SKU</span>
              <span>Precio</span>
              <span>Stock</span>
              <span></span>
            </div>
            {f.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_100px_80px_32px] items-center gap-2">
                <Input
                  value={v.name}
                  placeholder="M / Negro"
                  onChange={(e) => {
                    const arr = [...f.variants];
                    arr[i] = { ...v, name: e.target.value };
                    set("variants", arr);
                  }}
                />
                <Input
                  value={v.sku}
                  placeholder="auto"
                  onChange={(e) => {
                    const arr = [...f.variants];
                    arr[i] = { ...v, sku: e.target.value };
                    set("variants", arr);
                  }}
                />
                <Input
                  value={v.price}
                  placeholder="base"
                  inputMode="decimal"
                  onChange={(e) => {
                    const arr = [...f.variants];
                    arr[i] = { ...v, price: e.target.value };
                    set("variants", arr);
                  }}
                />
                <Input
                  value={v.stock}
                  inputMode="numeric"
                  onChange={(e) => {
                    const arr = [...f.variants];
                    arr[i] = { ...v, stock: e.target.value };
                    set("variants", arr);
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    set("variants", f.variants.filter((_, j) => j !== i))
                  }
                  className="flex h-9 items-center justify-center text-muted hover:text-red-600"
                  aria-label="Quitar variante"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Columna lateral */}
      <div className="space-y-6">
        <section className="rounded-brand border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg">Publicación</h2>
          <div className="space-y-4">
            <div>
              <Label>Estado</Label>
              <Select
                value={f.status}
                onChange={(e) =>
                  set("status", e.target.value as ProductFormInitial["status"])
                }
              >
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activo (visible)</option>
                <option value="ARCHIVED">Archivado</option>
              </Select>
            </div>
            <div>
              <Label>Marca</Label>
              <Select value={f.brandId} onChange={(e) => set("brandId", e.target.value)}>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Categoría</Label>
              <Input
                value={f.categoryName}
                onChange={(e) => set("categoryName", e.target.value)}
                placeholder="Indumentaria"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4"
              />
              Destacado en la home
            </label>
          </div>
        </section>

        <section className="rounded-brand border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-lg">Precio</h2>
          <div className="space-y-4">
            <div>
              <Label>Precio base *</Label>
              <Input
                value={f.basePrice}
                inputMode="decimal"
                placeholder="199.00"
                onChange={(e) => set("basePrice", e.target.value)}
              />
            </div>
            <div>
              <Label>Precio comparativo (tachado)</Label>
              <Input
                value={f.compareAtPrice}
                inputMode="decimal"
                onChange={(e) => set("compareAtPrice", e.target.value)}
              />
            </div>
            <div>
              <Label>Moneda</Label>
              <Select value={f.currency} onChange={(e) => set("currency", e.target.value)}>
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
                <option value="EUR">EUR</option>
              </Select>
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-brand bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={submit} disabled={pending || uploading} size="lg">
            {pending ? "Guardando…" : "Guardar producto"}
          </Button>
          {f.id && (
            <Button variant="ghost" onClick={handleDelete} disabled={pending}>
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
