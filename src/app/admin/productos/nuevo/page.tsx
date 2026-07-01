import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader title="Nuevo producto" description="Cargá una pieza nueva al catálogo." />
      <ProductForm brands={brands} />
    </div>
  );
}
