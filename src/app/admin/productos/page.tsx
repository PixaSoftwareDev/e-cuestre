import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Productos"
        description={`${products.length} productos en total`}
        action={
          <Button asChild size="sm">
            <Link href="/admin/productos/nuevo">
              <Plus className="h-4 w-4" /> Nuevo
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-brand border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium">Marca</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 text-right font-medium">Stock</th>
              <th className="p-4 text-right font-medium">Precio</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="border-b border-border/60 hover:bg-fg/[0.02]">
                  <td className="p-4">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-fg/5">
                        {p.images[0] && (
                          <Image
                            src={p.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium hover:text-primary">{p.name}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-muted">{p.brand.name}</td>
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
                      {p.status === "ACTIVE"
                        ? "Activo"
                        : p.status === "DRAFT"
                          ? "Borrador"
                          : "Archivado"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right tabular-nums">
                    <span className={stock <= 3 ? "text-red-600" : ""}>{stock}</span>
                  </td>
                  <td className="p-4 text-right tabular-nums">
                    {formatMoney(p.basePrice, p.currency)}
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted">
                  Todavía no cargaste productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
