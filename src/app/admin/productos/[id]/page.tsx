import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import {
  ProductForm,
  type ProductFormInitial,
} from "@/components/admin/product-form";

const dec = (cents: number | null | undefined) =>
  cents == null ? "" : (cents / 100).toFixed(2);

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        colors: {
          orderBy: { sortOrder: "asc" },
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            variants: { orderBy: { sortOrder: "asc" } },
          },
        },
        category: true,
      },
    }),
    prisma.brand.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brandId: product.brandId,
    categoryName: product.category?.name ?? "",
    description: product.description ?? "",
    story: product.story ?? "",
    material: product.material ?? "",
    basePrice: dec(product.basePrice),
    compareAtPrice: dec(product.compareAtPrice),
    currency: product.currency,
    status: product.status,
    featured: product.featured,
    tags: product.tags.join(", "),
    // Solo las imágenes/variantes GENERALES (sin color).
    images: product.images
      .filter((i) => !i.colorId)
      .map((i) => ({ url: i.url, alt: i.alt ?? undefined })),
    variants: product.variants
      .filter((v) => !v.colorId)
      .map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: dec(v.price),
        stock: String(v.stock),
      })),
    colors: product.colors.map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      images: c.images.map((i) => ({ url: i.url, alt: i.alt ?? undefined })),
      variants: c.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: dec(v.price),
        stock: String(v.stock),
      })),
    })),
  };

  return (
    <div>
      <PageHeader title="Editar producto" description={product.name} />
      <ProductForm brands={brands} initial={initial} />
    </div>
  );
}
