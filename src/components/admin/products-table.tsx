"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ProductRow = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  stock: number;
  price: number;
  currency: string;
  imageUrl?: string;
};

type SortKey = "name" | "stock" | "price";

const STATUS_LABEL: Record<ProductRow["status"], string> = {
  ACTIVE: "Activo",
  DRAFT: "Borrador",
  ARCHIVED: "Archivado",
};

export function ProductsTable({
  products,
  brands,
}: {
  products: ProductRow[];
  brands: { id: string; name: string }[];
}) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    let r = products;
    const query = q.trim().toLowerCase();
    if (query) r = r.filter((p) => p.name.toLowerCase().includes(query));
    if (brand) r = r.filter((p) => p.brandId === brand);
    if (status) r = r.filter((p) => p.status === status);
    return [...r].sort((a, b) => {
      const cmp =
        sortKey === "name"
          ? a.name.localeCompare(b.name)
          : a[sortKey] - b[sortKey];
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [products, q, brand, status, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  function SortHead({
    k,
    label,
    align = "left",
  }: {
    k: SortKey;
    label: string;
    align?: "left" | "right";
  }) {
    const active = sortKey === k;
    return (
      <th className={cn("p-4 font-medium", align === "right" && "text-right")}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={cn(
            "inline-flex items-center gap-1 transition-colors hover:text-fg",
            align === "right" && "flex-row-reverse",
            active && "text-fg",
          )}
        >
          {label}
          {active ? (
            sortDir === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
          )}
        </button>
      </th>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar producto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-[220px]"
        />
        <Select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="max-w-[200px]"
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[170px]"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="DRAFT">Borrador</option>
          <option value="ARCHIVED">Archivado</option>
        </Select>
        <span className="ml-auto text-xs text-muted">
          {rows.length} de {products.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-brand border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <SortHead k="name" label="Producto" />
              <th className="p-4 font-medium">Marca</th>
              <th className="p-4 font-medium">Estado</th>
              <SortHead k="stock" label="Stock" align="right" />
              <SortHead k="price" label="Precio" align="right" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/60 hover:bg-fg/[0.02]"
              >
                <td className="p-4">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-fg/5">
                      {p.imageUrl && (
                        <Image
                          src={p.imageUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium hover:text-primary">
                      {p.name}
                    </span>
                  </Link>
                </td>
                <td className="p-4 text-muted">{p.brandName}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      p.status === "ACTIVE"
                        ? "success"
                        : p.status === "DRAFT"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {STATUS_LABEL[p.status]}
                  </Badge>
                </td>
                <td className="p-4 text-right tabular-nums">
                  <span
                    className={p.stock <= 3 ? "text-red-600 dark:text-red-400" : ""}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 text-right tabular-nums">
                  {formatMoney(p.price, p.currency)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted">
                  No hay productos que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
