import { NextResponse, type NextRequest } from "next/server";
import { getProducts, productFromPrice } from "@/lib/queries";

/** Búsqueda instantánea del catálogo. Devuelve resultados livianos. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const products = await getProducts({ q });
  const results = products.slice(0, 8).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    image: p.images[0]?.url ?? null,
    price: productFromPrice(p),
    currency: p.currency,
  }));

  return NextResponse.json({ results });
}
