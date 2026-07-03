/**
 * Importa la marca "Horse Brand" y su catálogo (extraído de
 * shop.horse-brand.com) a la base local. SIN imágenes (se cargan luego desde
 * Cloudinary). Precios en ARS. Los productos sin precio confiable quedan como
 * BORRADOR (DRAFT) con precio 0 para completar a mano.
 *
 * Correr con:  npx tsx scripts/import-horse-brand.ts
 */
import { PrismaClient } from "@prisma/client";
import { THEME_PRESETS } from "../src/lib/theme";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type P = {
  name: string;
  price: number; // en pesos (se convierte a centavos)
  cat: string;
  desc: string;
  draft?: boolean;
  slug?: string;
};

const CATEGORIES: Record<string, string> = {
  "Polo Club": "polo-club",
  "Carteras & Accesorios": "carteras-accesorios",
  "Travel Collection": "travel-collection",
  "Leather Goods": "leather-goods",
  Home: "home",
};

const PRODUCTS: P[] = [
  { name: "Matera Polo Club", price: 249990, cat: "Polo Club", desc: "Confeccionada en cuero 100% vacuno color chocolate, diseñada para acompañarte siempre con estilo y funcionalidad. Su cierre doble frontal evita derrames." },
  { name: "Matera Tordillo", price: 155000, cat: "Polo Club", desc: "Una pieza única que combina estética y funcionalidad. Confeccionada en cuero natural y rafia, con interior completamente forrado." },
  { name: "Matera Alazán", price: 73500, cat: "Polo Club", desc: "Una pieza única, confeccionada íntegramente en cuero rígido color camel que asegura durabilidad y estilo atemporal." },
  { name: "Mate pintado I", price: 75900, cat: "Polo Club", desc: "Mate hecho en madera de algarrobo con terminación natural. Pintado a mano con un proceso de laqueado para mayor durabilidad y resistencia." },
  { name: "Mate pintado II", price: 75900, cat: "Polo Club", desc: "Mate hecho en madera de algarrobo con terminación natural. Pintado a mano con un proceso de laqueado. Cada pieza es única." },
  { name: "Mate negro quemado", price: 75900, cat: "Polo Club", desc: "Mate hecho en madera de algarrobo con terminación ebonizado, tiñendo la madera de un negro profundo y elegante manteniendo su veta natural." },
  { name: "Bombilla alpaca", price: 0, cat: "Polo Club", desc: "Bombilla de alpaca.", draft: true },
  { name: "Rienda Mini Bag", price: 79990, cat: "Carteras & Accesorios", desc: "Un toque clásico para el uso diario. Combina elegancia y funcionalidad en cuero natural con acabado vintage. Perfecta para teléfono y tarjetas." },
  { name: "Grooming Case", price: 77500, cat: "Carteras & Accesorios", desc: "Diseño funcional en un tono neutro y atemporal. Cuenta con un bolsillo interior y dos lengüetas laterales. Confeccionada en cuero floatter Stone." },
  { name: "Polo Travel Case", price: 95000, cat: "Carteras & Accesorios", desc: "Cuenta con un solo compartimiento y un bolsillo interior. Confeccionado en cuero floatter de alta calidad. Ideal para organizar cosméticos." },
  { name: "Necesser Heritage", price: 87500, cat: "Carteras & Accesorios", desc: "Neceser doble con bolsillo interno, cuero soft rose y diseño amplio. Ideal para viajar con estilo y elegancia." },
  { name: "Riñonera Noir Saddle", price: 93900, cat: "Carteras & Accesorios", desc: "En cuero natural vacuno negro, con cierres seguros y correa ajustable. Compacta y versátil, ideal para uso diario." },
  { name: "Cartera Magnolia", price: 160000, cat: "Carteras & Accesorios", desc: "Pequeña y sofisticada, con bolsillos prácticos y diseño en cuero floatter." },
  { name: "Palermo Travel Bag", price: 359900, cat: "Travel Collection", desc: "En cuero natural, ideal para viajar o para actividades deportivas gracias a su amplia capacidad y diseño funcional. Con bolsillo exterior." },
  { name: "Bolso Cavalier Holdall", price: 299900, cat: "Travel Collection", desc: "Elaborado 100% en cuero vacuno natural color camel, que combina amplitud y estilo en cada detalle. Ideal para escapadas, gimnasio o deporte." },
  { name: "Ascot Carryall", price: 399900, cat: "Travel Collection", desc: "Pensado especialmente para los partidos de polo, en cuero natural liso en un elegante tono marrón profundo. Su forma cilíndrica es muy práctica." },
  { name: "Windsor Weekender", price: 0, cat: "Travel Collection", desc: "Bolso de viaje en cuero natural con gran capacidad, bolsillos funcionales y correa desmontable. Ideal para tus viajes y deportes.", draft: true },
  { name: "Heritage Pack", price: 0, cat: "Travel Collection", desc: "Mochila durable y con múltiples compartimientos para organizar tus objetos con comodidad y estilo.", draft: true },
  { name: "Alfombra Holando", price: 369900, cat: "Leather Goods", desc: "Alfombra de cuero de vaca manchada, en piel vacuna natural de raza Holando, reconocida por sus tonos característicos en blanco y negro." },
  { name: "Alfombra Hereford", price: 369900, cat: "Leather Goods", desc: "Alfombra de cuero de vaca manchada, en piel vacuna natural de raza Hereford, que combina los tonos dulce de leche y blanco." },
  { name: "Alfombra Barcino Oscuro", price: 369900, cat: "Leather Goods", desc: "Alfombra de cuero de vaca atigrado oscuro que aporta un estilo auténtico y sofisticado a tus espacios. En piel vacuna natural." },
  { name: "Alfombra Barcino Claro", price: 369900, cat: "Leather Goods", desc: "Alfombra de cuero de vaca atigrado claro. Sus tonos suaves y superficie firme pero agradable al tacto generan un ambiente cálido." },
  { name: "Alfombra Salpicado Claro", price: 369900, cat: "Leather Goods", desc: "Alfombra de cuero de vaca beige que aporta un estilo rústico y natural a cualquier ambiente. En piel vacuna natural cuidadosamente curtida." },
  { name: "Corderito", price: 69990, cat: "Leather Goods", desc: "Alfombra u objeto decorativo para sillas, pie de cama o sillón, de cuero de oveja con pelo largo. Confort y calidez." },
  { name: "Cuero Lanar Beige", price: 0, cat: "Leather Goods", desc: "Alfombra de cuero lanar color beige que aporta calidez y elegancia a cualquier ambiente. En cuero natural de alta calidad.", draft: true },
  { name: "Cuero Lanar Blanco", price: 0, cat: "Leather Goods", desc: "Alfombra de cuero lanar color blanco que aporta un toque de elegancia y calidez a cualquier ambiente. En cuero natural de alta calidad.", draft: true },
  { name: "Silla Francesa", price: 429000, cat: "Home", desc: "Pieza de diseño único realizada en petiribi macizo combinado con esterilla francesa. Destaca por su nivel de detalle." },
  { name: "Espejo Écurie Redondo", price: 0, cat: "Home", desc: "Espejo Écurie redondo con marco de madera maciza petiribi de 80 cm. Ideal para decorar con elegancia.", draft: true },
  { name: "Set Cubiertos Pampas Heritage", price: 0, cat: "Home", desc: "Set x 6 cubiertos Pampas Heritage.", draft: true },
  { name: "Ascot Edition", price: 0, cat: "Home", desc: "Ascot Edition.", draft: true },
];

async function main() {
  console.log("📦 Importando Horse Brand…");

  const brand = await prisma.brand.upsert({
    where: { slug: "horse-brand" },
    update: {
      name: "Horse Brand",
      tagline: "El caballo nos inspira.",
      description:
        "Más que productos, un estilo de vida. Piezas de cuero, marroquinería y objetos de diseño inspirados en el mundo ecuestre.",
      active: true,
    },
    create: {
      slug: "horse-brand",
      name: "Horse Brand",
      tagline: "El caballo nos inspira.",
      description:
        "Más que productos, un estilo de vida. Piezas de cuero, marroquinería y objetos de diseño inspirados en el mundo ecuestre.",
      theme: THEME_PRESETS.ecuestre.theme,
      sortOrder: 3,
    },
  });
  console.log(`   ✔ Marca: ${brand.name}`);

  // Categorías
  const catIds: Record<string, string> = {};
  for (const [name, slug] of Object.entries(CATEGORIES)) {
    const existing = await prisma.category.findFirst({
      where: { brandId: brand.id, slug },
    });
    const cat =
      existing ??
      (await prisma.category.create({
        data: { brandId: brand.id, slug, name },
      }));
    catIds[name] = cat.id;
  }
  console.log(`   ✔ ${Object.keys(catIds).length} categorías`);

  // Productos
  let active = 0;
  let draft = 0;
  for (const p of PRODUCTS) {
    const slug = p.slug ?? slugify(p.name);
    await prisma.product.deleteMany({ where: { slug } });
    await prisma.product.create({
      data: {
        slug,
        name: p.name,
        description: p.desc,
        brandId: brand.id,
        categoryId: catIds[p.cat],
        basePrice: Math.round(p.price * 100), // pesos → centavos
        currency: "ARS",
        status: p.draft ? "DRAFT" : "ACTIVE",
        featured: false,
        tags: [slugify(p.cat)],
        variants: {
          create: [
            {
              sku: `${slug}-U`.toUpperCase(),
              name: "Único",
              stock: 10,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    if (p.draft) draft++;
    else active++;
  }
  console.log(`   ✔ ${active} productos activos, ${draft} en borrador (sin precio)`);
  console.log("✅ Import completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
