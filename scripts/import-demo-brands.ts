/**
 * Crea 2 marcas demo completas (logo, hero, productos con fotos coherentes,
 * talles, precios y reseñas). Imágenes en Cloudinary. Precios en ARS.
 * Correr con: npx tsx scripts/import-demo-brands.ts
 */
import { PrismaClient } from "@prisma/client";
import { THEME_PRESETS } from "../src/lib/theme";

const prisma = new PrismaClient();
const IMG = "https://res.cloudinary.com/dukv3ov6t/image/upload/";
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "y").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Rev = { rating: number; title?: string; comment: string; author: string; verified: boolean };
type Prod = {
  slug: string; name: string; price: number; category: string; desc: string;
  imgs: string[]; variants: { name: string; stock: number }[]; reviews?: Rev[];
};
type Brand = {
  slug: string; name: string; tagline: string; description: string;
  theme: unknown; logo: string; hero: string; sortOrder: number; products: Prod[];
};

const BRANDS: Brand[] = [
  {
    slug: "campo-cancha",
    name: "Campo & Cancha",
    tagline: "Equipamiento para el jinete moderno.",
    description:
      "Indumentaria y equipo técnico para montar con seguridad y estilo. Materiales de alto rendimiento, terminaciones prolijas y ajuste pensado para la cancha.",
    theme: THEME_PRESETS.equipo.theme,
    logo: "gjtj6qmov8hxtxc16k0s.png",
    hero: "uimmqsj04ucfojwpdrew.jpg",
    sortOrder: 4,
    products: [
      {
        slug: "bota-de-montar", name: "Bota de Montar", price: 185000, category: "Indumentaria",
        desc: "Bota alta de cuero con caña rígida y elástico posterior. Suela antideslizante y calce firme para el estribo.",
        imgs: ["zjuq5pn8ygec92welbak.jpg", "dopjrwtrm8h5omnrt1ll.jpg"],
        variants: [{ name: "38", stock: 4 }, { name: "39", stock: 6 }, { name: "40", stock: 7 }, { name: "41", stock: 5 }, { name: "42", stock: 3 }],
        reviews: [
          { rating: 5, title: "Excelentes", comment: "Cómodas desde el primer día y muy bien terminadas.", author: "Valentina S.", verified: true },
          { rating: 4, comment: "Muy buenas, la caña un poco dura al principio.", author: "Tomás L.", verified: false },
        ],
      },
      {
        slug: "casco-de-equitacion", name: "Casco de Equitación", price: 145000, category: "Equipamiento",
        desc: "Casco con certificación de seguridad, ventilación superior y regulación de calce. Interior desmontable y lavable.",
        imgs: ["nhjgkyzksnwhhb9tkx39.jpg", "ofx8izzc5fwrzeww9bxw.jpg"],
        variants: [{ name: "S", stock: 5 }, { name: "M", stock: 8 }, { name: "L", stock: 4 }],
        reviews: [{ rating: 5, title: "Seguridad y confort", comment: "Liviano y muy ventilado. Se ajusta perfecto.", author: "Camila R.", verified: true }],
      },
      {
        slug: "guantes-de-montar", name: "Guantes de Montar", price: 38000, category: "Accesorios",
        desc: "Guantes de tacto fino con refuerzo en la palma y buena adherencia a la rienda. Transpirables.",
        imgs: ["rrpazpqr5e5dcl2omrgt.jpg", "oe7sgrlh8caa9smydjy4.jpg"],
        variants: [{ name: "S", stock: 10 }, { name: "M", stock: 12 }, { name: "L", stock: 6 }],
      },
      {
        slug: "fusta", name: "Fusta de Salto", price: 22000, category: "Accesorios",
        desc: "Fusta liviana y balanceada, con puño antideslizante y terminación en cuero. Largo ideal para salto.",
        imgs: ["gjpqrfdmwvffgnouhndd.jpg", "mzhycr19q2hn3jwmpx1a.jpg"],
        variants: [{ name: "Único", stock: 14 }],
      },
      {
        slug: "breeches", name: "Breeches de Competición", price: 89000, category: "Indumentaria",
        desc: "Pantalón de montar con rodillera de grip, cintura media y tela elastizada que acompaña el movimiento.",
        imgs: ["idt7puf0adi5bnb3crq7.jpg", "rp4znur04h2fnnmlwhxp.jpg"],
        variants: [{ name: "38", stock: 5 }, { name: "40", stock: 7 }, { name: "42", stock: 6 }, { name: "44", stock: 3 }],
        reviews: [{ rating: 5, comment: "El grip en la rodilla se nota muchísimo. Muy cómodo.", author: "Facundo M.", verified: true }],
      },
    ],
  },
  {
    slug: "talabarteria-sur",
    name: "Talabartería del Sur",
    tagline: "Cuero noble, oficio de manos.",
    description:
      "Marroquinería y talabartería fina en cuero vacuno curtido natural. Piezas cosidas a mano, pensadas para durar y ganar carácter con los años.",
    theme: THEME_PRESETS.noir.theme,
    logo: "vctloyeli3ouchrv14ko.png",
    hero: "euxirwilot2jrbfpae43.jpg",
    sortOrder: 5,
    products: [
      {
        slug: "cinturon-de-cuero", name: "Cinturón de Cuero", price: 42000, category: "Marroquinería",
        desc: "Cinturón de cuero macizo con hebilla de bronce macizo. Corte a mano y bordes sellados.",
        imgs: ["evusk5xejkd9a75caxti.jpg", "st5qi2vmn1ubpdx0vusm.jpg"],
        variants: [{ name: "90", stock: 6 }, { name: "95", stock: 8 }, { name: "100", stock: 7 }, { name: "105", stock: 4 }],
        reviews: [{ rating: 5, title: "Un lujo", comment: "El cuero es hermoso y la hebilla pesa. Se nota el oficio.", author: "Ignacio P.", verified: true }],
      },
      {
        slug: "cabezada", name: "Cabezada de Cuero", price: 128000, category: "Talabartería",
        desc: "Cabezada trabajada en cuero natural con costura reforzada y herrajes de bronce. Regulable.",
        imgs: ["jaf9o5m2kzq8wghduamf.jpg", "onpssryxfkturx7golgd.jpg"],
        variants: [{ name: "Cob", stock: 4 }, { name: "Full", stock: 6 }],
        reviews: [{ rating: 5, comment: "Impecable el trabajo del cuero. Muy resistente.", author: "Rocío D.", verified: false }],
      },
      {
        slug: "rinonera-de-cuero", name: "Riñonera de Cuero", price: 76000, category: "Marroquinería",
        desc: "Riñonera compacta en cuero soft, con cierre metálico y correa ajustable. Ideal para el día a día.",
        imgs: ["pcuxi3u4ic94yrcxldre.jpg", "t94jefv9iayuxij22qbr.jpg"],
        variants: [{ name: "Único", stock: 9 }],
      },
      {
        slug: "portafolio-de-cuero", name: "Portafolio de Cuero", price: 198000, category: "Marroquinería",
        desc: "Portafolio estructurado en cuero vegetal, con divisiones internas y manija reforzada. Elegancia atemporal.",
        imgs: ["rviekwlqpk727sbxlkpk.jpg", "kk5umxxgcnfuhmozjwn1.jpg"],
        variants: [{ name: "Único", stock: 5 }],
        reviews: [{ rating: 5, title: "Distinguido", comment: "Me lo llevo a todas las reuniones. Impecable.", author: "Martín Q.", verified: true }],
      },
      {
        slug: "billetera-de-cuero", name: "Billetera de Cuero", price: 54000, category: "Marroquinería",
        desc: "Billetera de cuero natural con múltiples ranuras y costura a mano. Fina y resistente.",
        imgs: ["xztxv5l3pvrxza9kaegz.jpg", "hcp3lscfon7aabe21dcb.jpg"],
        variants: [{ name: "Único", stock: 12 }],
      },
    ],
  },
];

async function main() {
  console.log("📦 Importando 2 marcas demo…");
  for (const b of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, tagline: b.tagline, description: b.description, logoUrl: IMG + b.logo, heroImageUrl: IMG + b.hero, active: true, sortOrder: b.sortOrder },
      create: { slug: b.slug, name: b.name, tagline: b.tagline, description: b.description, theme: b.theme as object, logoUrl: IMG + b.logo, heroImageUrl: IMG + b.hero, sortOrder: b.sortOrder },
    });

    const cats: Record<string, string> = {};
    for (const p of b.products) {
      if (cats[p.category]) continue;
      const cslug = slugify(p.category);
      const existing = await prisma.category.findFirst({ where: { brandId: brand.id, slug: cslug } });
      cats[p.category] = existing ? existing.id : (await prisma.category.create({ data: { brandId: brand.id, slug: cslug, name: p.category } })).id;
    }

    for (const p of b.products) {
      await prisma.product.deleteMany({ where: { slug: p.slug } });
      const product = await prisma.product.create({
        data: {
          slug: p.slug, name: p.name, description: p.desc, brandId: brand.id, categoryId: cats[p.category],
          basePrice: p.price * 100, currency: "ARS", status: "ACTIVE", featured: false, tags: [slugify(p.category)],
          images: { create: p.imgs.map((id, i) => ({ url: IMG + id, alt: `${p.name} ${i + 1}`, sortOrder: i })) },
          variants: { create: p.variants.map((v, i) => ({ sku: `${p.slug}-${i}`.toUpperCase(), name: v.name, stock: v.stock, sortOrder: i })) },
        },
      });
      if (p.reviews?.length) {
        await prisma.review.createMany({
          data: p.reviews.map((r) => ({
            productId: product.id, rating: r.rating, title: r.title ?? null, comment: r.comment,
            authorName: r.author, email: `${slugify(r.author.split(" ")[0])}@example.com`, verified: r.verified, approved: true,
          })),
        });
      }
    }
    console.log(`   ✔ ${b.name}: ${b.products.length} productos`);
  }
  console.log("✅ Marcas demo listas.");
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
