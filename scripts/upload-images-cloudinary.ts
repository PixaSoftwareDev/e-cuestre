/**
 * Descarga las fotos de cada producto desde shop.horse-brand.com y las sube a
 * Cloudinary (unsigned), guardando las URLs resultantes en product.images.
 *
 * Correr con:  npx tsx scripts/upload-images-cloudinary.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLOUD = "dukv3ov6t";
const PRESET = "Ecustre";
const FOLDER = "E-cuestre";
const BASE = "https://shop.horse-brand.com";

// handle en horse-brand  →  slug en nuestra base
const MAP: Record<string, string> = {
  "matera-hook": "matera-polo-club",
  "matera-chetta1": "matera-tordillo",
  "matera-single": "matera-alazan",
  "mate-pintado-i": "mate-pintado-i",
  "mate-pintado-ii": "mate-pintado-ii",
  "mate-negro-quemado": "mate-negro-quemado",
  "bombilla-alpaca-f4gu0": "bombilla-alpaca",
  "mini-bag": "rienda-mini-bag",
  "travel-m": "grooming-case",
  "polo-case": "polo-travel-case",
  "neceser-heritage": "necesser-heritage",
  "rinonera-noir-saddle": "rinonera-noir-saddle",
  "cartera-magnolia": "cartera-magnolia",
  "bolso-de-viaje": "palermo-travel-bag",
  "bolso-pre": "bolso-cavalier-holdall",
  "bolso-classy": "ascot-carryall",
  "windsor-weekender": "windsor-weekender",
  "heritage-pack": "heritage-pack",
  "alfombra-holando": "alfombra-holando",
  "alfombra-hereford": "alfombra-hereford",
  "alfombra-barcino-oscuro": "alfombra-barcino-oscuro",
  "alfombra-barcino-claro": "alfombra-barcino-claro",
  "alfombra-salpicado-claro": "alfombra-salpicado-claro",
  corderito: "corderito",
  "cuero-lanar1": "cuero-lanar-beige",
  "cuero-lanar": "cuero-lanar-blanco",
  "silla-francesa": "silla-francesa",
  "espejo-ecurie-redondo": "espejo-ecurie-redondo",
  "set-cubiertos-pampas-heritage-m2p8i": "set-cubiertos-pampas-heritage",
  cuchillos: "ascot-edition",
};

function extractImages(html: string): string[] {
  const re =
    /(?:https?:)?\/\/[a-z-]*dcdn[^"'\s]*?\/products\/[^"'\s)]+?\.(?:webp|jpg|jpeg|png)/gi;
  const raw = html.match(re) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (let u of raw) {
    u = u
      .replace(/^\/\//, "https://")
      .replace(/^http:/, "https:")
      .replace(/\/tmp\//, "/")
      .replace(/-\d+-\d+\.(webp|jpg|jpeg|png)$/i, "-1024-1024.$1");
    const base = u.replace(/-\d+-\d+\.\w+$/, "");
    if (seen.has(base)) continue;
    seen.add(base);
    out.push(u);
  }
  return out.slice(0, 6);
}

async function uploadToCloudinary(imageUrl: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", imageUrl);
  fd.append("upload_preset", PRESET);
  fd.append("asset_folder", FOLDER);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body: fd },
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message ?? "upload falló");
  return data.secure_url as string;
}

async function main() {
  console.log("🖼️  Subiendo imágenes a Cloudinary…");
  let okProducts = 0;
  let totalImgs = 0;
  const missing: string[] = [];

  for (const [handle, slug] of Object.entries(MAP)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      missing.push(`sin producto para ${slug}`);
      continue;
    }
    let html = "";
    try {
      html = await fetch(`${BASE}/productos/${handle}/`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      }).then((r) => r.text());
    } catch {
      missing.push(`fetch falló: ${handle}`);
      continue;
    }
    const imgs = extractImages(html);
    if (!imgs.length) {
      missing.push(`sin imágenes: ${handle}`);
      continue;
    }

    const uploaded: string[] = [];
    for (const img of imgs) {
      try {
        uploaded.push(await uploadToCloudinary(img));
      } catch (e) {
        console.log(`   ⚠ ${slug}: ${(e as Error).message}`);
      }
    }
    if (!uploaded.length) {
      missing.push(`nada subido: ${handle}`);
      continue;
    }

    // Reemplazar imágenes generales del producto.
    await prisma.productImage.deleteMany({
      where: { productId: product.id, colorId: null },
    });
    await prisma.productImage.createMany({
      data: uploaded.map((url, i) => ({
        productId: product.id,
        url,
        alt: `${product.name} ${i + 1}`,
        sortOrder: i,
      })),
    });
    okProducts++;
    totalImgs += uploaded.length;
    console.log(`   ✔ ${slug} (${uploaded.length} fotos)`);
  }

  console.log(`\n✅ ${okProducts} productos con imágenes, ${totalImgs} fotos subidas.`);
  if (missing.length) console.log("⚠ Pendientes:", missing.join(" | "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
