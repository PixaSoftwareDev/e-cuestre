"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional(),
  brandId: z.string().min(1),
  categoryName: z.string().optional(),
  description: z.string().optional(),
  story: z.string().optional(),
  material: z.string().optional(),
  basePrice: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().default("USD"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  images: z
    .array(z.object({ url: z.string().min(1), alt: z.string().optional() }))
    .default([]),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        sku: z.string().optional(),
        price: z.number().int().nonnegative().nullable().optional(),
        stock: z.number().int().nonnegative(),
      }),
    )
    .min(1, "Agregá al menos una variante"),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function saveProduct(input: ProductInput) {
  await requireAdmin();
  const data = productSchema.parse(input);

  const slug = slugify(data.slug || data.name);

  // Categoría opcional: upsert por (brandId, slug).
  let categoryId: string | undefined;
  if (data.categoryName && data.categoryName.trim()) {
    const catSlug = slugify(data.categoryName);
    const existing = await prisma.category.findFirst({
      where: { brandId: data.brandId, slug: catSlug },
    });
    categoryId = existing
      ? existing.id
      : (
          await prisma.category.create({
            data: { brandId: data.brandId, slug: catSlug, name: data.categoryName.trim() },
          })
        ).id;
  }

  const baseData = {
    name: data.name,
    slug,
    brandId: data.brandId,
    categoryId: categoryId ?? null,
    description: data.description || null,
    story: data.story || null,
    material: data.material || null,
    basePrice: data.basePrice,
    compareAtPrice: data.compareAtPrice ?? null,
    currency: data.currency,
    status: data.status,
    featured: data.featured,
    tags: data.tags,
  };

  let productId = data.id;

  if (productId) {
    await prisma.product.update({ where: { id: productId }, data: baseData });
    // Reemplazamos imágenes (simple y consistente).
    await prisma.productImage.deleteMany({ where: { productId } });
  } else {
    const created = await prisma.product.create({ data: baseData });
    productId = created.id;
  }

  // Imágenes
  if (data.images.length) {
    await prisma.productImage.createMany({
      data: data.images.map((img, i) => ({
        productId: productId!,
        url: img.url,
        alt: img.alt || data.name,
        sortOrder: i,
      })),
    });
  }

  // Variantes: upsert por id; borramos las que ya no están.
  const keepIds: string[] = [];
  for (let i = 0; i < data.variants.length; i++) {
    const v = data.variants[i];
    const sku = (v.sku && v.sku.trim()) || `${slug}-${i}`.toUpperCase();
    if (v.id) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { name: v.name, sku, price: v.price ?? null, stock: v.stock, sortOrder: i },
      });
      keepIds.push(v.id);
    } else {
      const created = await prisma.productVariant.create({
        data: {
          productId: productId!,
          name: v.name,
          sku,
          price: v.price ?? null,
          stock: v.stock,
          sortOrder: i,
        },
      });
      keepIds.push(created.id);
    }
  }
  await prisma.productVariant.deleteMany({
    where: { productId: productId!, id: { notIn: keepIds } },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true, id: productId };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return { ok: true };
}

/** Ajuste rápido de stock de una variante desde la lista. */
export async function setVariantStock(variantId: string, stock: number) {
  await requireAdmin();
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: Math.max(0, Math.floor(stock)) },
  });
  revalidatePath("/admin/productos");
  return { ok: true };
}
