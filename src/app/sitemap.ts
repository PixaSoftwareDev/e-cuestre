import type { MetadataRoute } from "next";
import { getActiveProductSlugs, getBrands } from "@/lib/queries";

// Consulta la base (marcas/productos): debe generarse en runtime, no en build
// (durante el build no hay conexión a la DB).
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, brands] = await Promise.all([
    getActiveProductSlugs(),
    getBrands(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/productos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/favoritos`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${SITE_URL}/marca/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/producto/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...brandRoutes, ...productRoutes];
}
