import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Marcas"
        description="Cada marca tiene su propio diseño y catálogo."
        action={
          <Button asChild size="sm">
            <Link href="/admin/marcas/nueva">
              <Plus className="h-4 w-4" /> Nueva
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/admin/marcas/${b.id}`}
            className="group overflow-hidden rounded-brand border border-border bg-card transition-colors hover:border-fg/30"
          >
            <div className="relative aspect-video bg-fg/5">
              {b.heroImageUrl && (
                <Image src={b.heroImageUrl} alt="" fill sizes="360px" className="object-cover" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg">{b.name}</h3>
                {b.active ? (
                  <Badge variant="success">Activa</Badge>
                ) : (
                  <Badge variant="muted">Oculta</Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">{b._count.products} productos</p>
            </div>
          </Link>
        ))}
        {brands.length === 0 && (
          <p className="text-sm text-muted">Todavía no hay marcas.</p>
        )}
      </div>
    </div>
  );
}
