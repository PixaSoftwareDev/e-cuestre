import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  ProductsTable,
  type ProductRow,
} from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const [products, brands] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        brand: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: true,
      },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    brandId: p.brandId,
    brandName: p.brand.name,
    status: p.status,
    stock: p.variants.reduce((n, v) => n + v.stock, 0),
    price: p.basePrice,
    currency: p.currency,
    imageUrl: p.images[0]?.url,
  }));

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

      <ProductsTable products={rows} brands={brands} />
    </div>
  );
}
