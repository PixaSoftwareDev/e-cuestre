import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Producto con todo lo necesario para tarjetas y páginas. */
const productInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: { sortOrder: "asc" } },
  colors: {
    orderBy: { sortOrder: "asc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  },
  brand: true,
  category: true,
} satisfies Prisma.ProductInclude;

export type ProductFull = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export async function getBrands() {
  return prisma.brand.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}

/**
 * Categorías para los filtros de la tienda. Si se pasa `brandSlug`, se acotan
 * a esa marca. Las categorías son por-marca (`@@unique([brandId, slug])`), así
 * que deduplicamos por slug para no repetir "Indumentaria" una vez por marca.
 */
export async function getCategories(
  brandSlug?: string,
): Promise<{ slug: string; name: string }[]> {
  const rows = await prisma.category.findMany({
    where: brandSlug ? { brand: { slug: brandSlug } } : {},
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });
  const bySlug = new Map<string, { slug: string; name: string }>();
  for (const c of rows) if (!bySlug.has(c.slug)) bySlug.set(c.slug, c);
  return [...bySlug.values()];
}

/**
 * Categorías para la vidriera del home: cada una con una imagen representativa
 * (la propia si tiene, si no la del primer producto activo). Descarta las que
 * no tienen imagen para no mostrar tiles vacíos.
 */
export async function getCategoriesForHome(
  limit = 6,
): Promise<{ slug: string; name: string; imageUrl: string }[]> {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      imageUrl: true,
      products: {
        where: { status: "ACTIVE" },
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        take: 1,
        select: {
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });
  const bySlug = new Map<string, { slug: string; name: string; imageUrl: string }>();
  for (const c of rows) {
    if (bySlug.has(c.slug)) continue;
    const img = c.imageUrl ?? c.products[0]?.images[0]?.url ?? null;
    if (!img) continue;
    bySlug.set(c.slug, { slug: c.slug, name: c.name, imageUrl: img });
  }
  return [...bySlug.values()].slice(0, limit);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductFull[]> {
  return prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

/** Productos en oferta (tienen precio comparativo cargado desde el admin). */
export async function getOffers(limit = 8): Promise<ProductFull[]> {
  return prisma.product.findMany({
    where: { status: "ACTIVE", compareAtPrice: { not: null } },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export type ProductFilters = {
  brandSlug?: string;
  categorySlug?: string;
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc";
};

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductFull[]> {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (filters.brandSlug) where.brand = { slug: filters.brandSlug };
  if (filters.categorySlug) where.category = { slug: filters.categorySlug };
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { tags: { has: filters.q.toLowerCase() } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { basePrice: "asc" }
      : filters.sort === "price-desc"
        ? { basePrice: "desc" }
        : { createdAt: "desc" };

  return prisma.product.findMany({ where, include: productInclude, orderBy });
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductFull | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
}

export async function getActiveProductSlugs() {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

/** Stock total de un producto (suma de variantes). */
export function productStock(p: ProductFull): number {
  return p.variants.reduce((n, v) => n + v.stock, 0);
}

/** Precio "desde": menor precio entre variantes o basePrice. */
export function productFromPrice(p: ProductFull): number {
  const prices = p.variants
    .map((v) => v.price ?? p.basePrice)
    .filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : p.basePrice;
}
