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

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
});

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional(),
});

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
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
  colors: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        hex: z.string().min(1),
        images: z.array(imageSchema).default([]),
        variants: z.array(variantSchema).default([]),
      }),
    )
    .default([]),
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
    // Reemplazamos imágenes GENERALES (las de colores se manejan aparte).
    await prisma.productImage.deleteMany({
      where: { productId, colorId: null },
    });
  } else {
    const created = await prisma.product.create({ data: baseData });
    productId = created.id;
  }

  // Imágenes generales (sin color)
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

  // Variantes generales (sin color): upsert por id; borrar las que ya no están.
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
    where: { productId: productId!, colorId: null, id: { notIn: keepIds } },
  });

  // Colores: borramos los existentes (con sus fotos/talles) y los recreamos.
  const oldColors = await prisma.productColor.findMany({
    where: { productId: productId! },
    select: { id: true },
  });
  const oldColorIds = oldColors.map((c) => c.id);
  if (oldColorIds.length) {
    await prisma.productImage.deleteMany({
      where: { colorId: { in: oldColorIds } },
    });
    await prisma.productVariant.deleteMany({
      where: { colorId: { in: oldColorIds } },
    });
    await prisma.productColor.deleteMany({ where: { id: { in: oldColorIds } } });
  }
  for (let ci = 0; ci < data.colors.length; ci++) {
    const c = data.colors[ci];
    const color = await prisma.productColor.create({
      data: { productId: productId!, name: c.name, hex: c.hex, sortOrder: ci },
    });
    if (c.images.length) {
      await prisma.productImage.createMany({
        data: c.images.map((img, i) => ({
          productId: productId!,
          colorId: color.id,
          url: img.url,
          alt: img.alt || `${data.name} ${c.name}`,
          sortOrder: i,
        })),
      });
    }
    if (c.variants.length) {
      await prisma.productVariant.createMany({
        data: c.variants.map((v, i) => ({
          productId: productId!,
          colorId: color.id,
          name: v.name,
          sku:
            (v.sku && v.sku.trim()) ||
            `${slug}-${c.name}-${i}`.toUpperCase().replace(/\s+/g, ""),
          price: v.price ?? null,
          stock: v.stock,
          sortOrder: i,
        })),
      });
    }
  }

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
