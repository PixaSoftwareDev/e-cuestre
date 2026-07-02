import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { THEME_PRESETS } from "../src/lib/theme";

const prisma = new PrismaClient();

// Imágenes demo locales (generadas por scripts/gen-placeholders.mjs), así la
// demo no depende de servicios externos. En producción se cargan desde el admin.
const img = (seed: string, _w = 900, _h = 1125) => `/seed/${seed}.jpg`;

async function main() {
  console.log("🌱 Sembrando base de datos…");

  // ── Admin ───────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ecuestre.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "cambiame123";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrador",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "admin",
    },
  });
  console.log(`   ✔ Admin: ${adminEmail}`);

  // ── Marcas ──────────────────────────────────────────────
  const brandsData = [
    {
      slug: "casa-del-polo",
      name: "Casa del Polo",
      tagline: "Talabartería y estilo para la cancha y la vida.",
      description:
        "Fundada sobre el oficio de la talabartería fina, Casa del Polo crea piezas de cuero y objetos para quienes viven el polo con pasión y elegancia.",
      theme: THEME_PRESETS.ecuestre.theme,
      hero: "polo-hero",
    },
    {
      slug: "noir",
      name: "Noir Equestrian",
      tagline: "Lujo silencioso para el jinete moderno.",
      description:
        "Una línea sobria y contemporánea. Negro, champagne y materiales nobles para un guardarropa ecuestre atemporal.",
      theme: THEME_PRESETS.noir.theme,
      hero: "noir-hero",
    },
    {
      slug: "campo-sport",
      name: "Campo Sport",
      tagline: "Equipamiento técnico para el día a día en el campo.",
      description:
        "Prendas y accesorios resistentes, pensados para el trabajo y el deporte. Funcional, cómodo, durable.",
      theme: THEME_PRESETS.equipo.theme,
      hero: "campo-hero",
    },
  ];

  const brands: Record<string, string> = {};
  for (let i = 0; i < brandsData.length; i++) {
    const b = brandsData[i];
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        tagline: b.tagline,
        description: b.description,
        theme: b.theme,
        heroImageUrl: img(b.hero, 1920, 1200),
        sortOrder: i,
        active: true,
      },
      create: {
        slug: b.slug,
        name: b.name,
        tagline: b.tagline,
        description: b.description,
        theme: b.theme,
        heroImageUrl: img(b.hero, 1920, 1200),
        sortOrder: i,
      },
    });
    brands[b.slug] = brand.id;
  }
  console.log(`   ✔ ${brandsData.length} marcas`);

  // ── Categorías (una tanda por marca) ────────────────────
  async function ensureCategory(brandId: string, slug: string, name: string) {
    const existing = await prisma.category.findFirst({
      where: { brandId, slug },
    });
    if (existing) return existing.id;
    const c = await prisma.category.create({
      data: { brandId, slug, name },
    });
    return c.id;
  }

  // ── Productos ───────────────────────────────────────────
  type Seed = {
    brand: string;
    category: [string, string];
    slug: string;
    name: string;
    description: string;
    story?: string;
    material?: string;
    price: number; // centavos
    compareAt?: number;
    featured?: boolean;
    tags: string[];
    images: string[];
    variants: { name: string; stock: number; price?: number }[];
    colors?: {
      name: string;
      hex: string;
      images: string[];
      variants: { name: string; stock: number }[];
    }[];
  };

  const products: Seed[] = [
    {
      brand: "casa-del-polo",
      category: ["talabarteria", "Talabartería"],
      slug: "cinto-de-polo-artesanal",
      name: "Cinto de Polo Artesanal",
      description:
        "Cinto trenzado a mano en cuero vacuno curtido vegetal, con hebilla de bronce macizo.",
      story:
        "Cada cinto lleva más de cuatro horas de trenzado manual en nuestro taller. El cuero se oscurece con el uso, ganando carácter con los años.",
      material: "Cuero curtido vegetal · Bronce",
      price: 12900,
      compareAt: 15900,
      featured: true,
      tags: ["cuero", "cinto", "polo"],
      images: [img("cinto-1"), img("cinto-2"), img("cinto-3")],
      variants: [
        { name: "80 cm", stock: 8 },
        { name: "85 cm", stock: 12 },
        { name: "90 cm", stock: 6 },
        { name: "95 cm", stock: 0 },
      ],
    },
    {
      brand: "casa-del-polo",
      category: ["talabarteria", "Talabartería"],
      slug: "porta-fusta-de-cuero",
      name: "Porta Fusta de Cuero",
      description: "Estuche de cuero para fusta, con costura a mano y broche de latón.",
      material: "Cuero · Latón",
      price: 8900,
      featured: true,
      tags: ["cuero", "accesorio"],
      images: [img("fusta-1"), img("fusta-2")],
      variants: [{ name: "Natural", stock: 15 }, { name: "Suela", stock: 9 }],
    },
    {
      brand: "casa-del-polo",
      category: ["indumentaria", "Indumentaria"],
      slug: "camisa-de-juego-clasica",
      name: "Camisa de Juego Clásica",
      description: "Camisa de polo en piqué de algodón peinado, corte atlético.",
      material: "100% algodón peinado",
      price: 9900,
      featured: true,
      tags: ["indumentaria", "camisa"],
      // Las fotos y los talles vienen por color.
      images: [],
      variants: [],
      colors: [
        {
          name: "Blanco",
          hex: "#f3f2ec",
          images: ["/seed/camisa-blanco-1.jpg", "/seed/camisa-blanco-2.jpg"],
          variants: [
            { name: "S", stock: 10 },
            { name: "M", stock: 14 },
            { name: "L", stock: 8 },
          ],
        },
        {
          name: "Azul",
          hex: "#2b3a67",
          images: ["/seed/camisa-azul-1.jpg", "/seed/camisa-azul-2.jpg"],
          variants: [
            { name: "S", stock: 6 },
            { name: "M", stock: 9 },
            { name: "L", stock: 0 },
          ],
        },
      ],
    },
    {
      brand: "noir",
      category: ["indumentaria", "Indumentaria"],
      slug: "campera-noir-softshell",
      name: "Campera Noir Softshell",
      description:
        "Softshell técnica en negro absoluto, repelente al agua y cortavientos.",
      story:
        "Diseñada para la transición entre la cancha y la ciudad. Silueta limpia, detalles ocultos, cero logos a la vista.",
      material: "Softshell reciclado",
      price: 34900,
      featured: true,
      tags: ["campera", "tecnico", "negro"],
      images: [img("campera-1"), img("campera-2"), img("campera-3")],
      variants: [
        { name: "S", stock: 6 },
        { name: "M", stock: 8 },
        { name: "L", stock: 7 },
      ],
    },
    {
      brand: "noir",
      category: ["accesorios", "Accesorios"],
      slug: "guantes-noir-nappa",
      name: "Guantes Noir Nappa",
      description: "Guantes de conducción en napa negra con detalle champagne.",
      material: "Cuero napa",
      price: 15900,
      featured: true,
      tags: ["guantes", "cuero"],
      images: [img("guantes-1"), img("guantes-2")],
      variants: [
        { name: "8", stock: 4 },
        { name: "8.5", stock: 6 },
        { name: "9", stock: 3 },
      ],
    },
    {
      brand: "campo-sport",
      category: ["indumentaria", "Indumentaria"],
      slug: "chaleco-de-campo",
      name: "Chaleco de Campo Acolchado",
      description: "Chaleco acolchado liviano, ideal para media estación.",
      material: "Nylon · Relleno técnico",
      price: 18900,
      compareAt: 22900,
      featured: true,
      tags: ["chaleco", "campo"],
      images: [img("chaleco-1"), img("chaleco-2"), img("chaleco-3")],
      variants: [
        { name: "M", stock: 12 },
        { name: "L", stock: 10 },
        { name: "XL", stock: 8 },
      ],
    },
    {
      brand: "campo-sport",
      category: ["calzado", "Calzado"],
      slug: "botas-de-trabajo",
      name: "Botas de Trabajo Reforzadas",
      description: "Botas de cuero engrasado con suela antideslizante.",
      material: "Cuero engrasado · Goma",
      price: 27900,
      featured: false,
      tags: ["botas", "calzado"],
      images: [img("botas-1"), img("botas-2")],
      variants: [
        { name: "40", stock: 5 },
        { name: "41", stock: 7 },
        { name: "42", stock: 6 },
        { name: "43", stock: 4 },
      ],
    },
  ];

  let count = 0;
  for (const p of products) {
    const brandId = brands[p.brand];
    const categoryId = await ensureCategory(brandId, p.category[0], p.category[1]);

    // Borramos y recreamos para que el seed sea idempotente y consistente.
    await prisma.product.deleteMany({ where: { slug: p.slug } });
    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        story: p.story,
        material: p.material,
        brandId,
        categoryId,
        basePrice: p.price,
        compareAtPrice: p.compareAt,
        currency: "USD",
        status: "ACTIVE",
        featured: p.featured ?? false,
        tags: p.tags,
        images: {
          create: p.images.map((url, idx) => ({
            url,
            alt: `${p.name} ${idx + 1}`,
            sortOrder: idx,
          })),
        },
        variants: {
          create: p.variants.map((v, idx) => ({
            sku: `${p.slug}-${idx}`.toUpperCase(),
            name: v.name,
            price: v.price ?? null,
            stock: v.stock,
            sortOrder: idx,
          })),
        },
      },
    });

    // Colores: cada uno con sus fotos y sus talles (color × talle).
    for (let ci = 0; ci < (p.colors?.length ?? 0); ci++) {
      const c = p.colors![ci];
      const color = await prisma.productColor.create({
        data: { productId: product.id, name: c.name, hex: c.hex, sortOrder: ci },
      });
      await prisma.productImage.createMany({
        data: c.images.map((url, idx) => ({
          productId: product.id,
          colorId: color.id,
          url,
          alt: `${p.name} ${c.name} ${idx + 1}`,
          sortOrder: idx,
        })),
      });
      await prisma.productVariant.createMany({
        data: c.variants.map((v, idx) => ({
          productId: product.id,
          colorId: color.id,
          sku: `${p.slug}-${c.name}-${idx}`.toUpperCase().replace(/\s+/g, ""),
          name: v.name,
          stock: v.stock,
          sortOrder: idx,
        })),
      });
    }
    count++;
  }
  console.log(`   ✔ ${count} productos`);

  // ── Reseñas demo (aprobadas) ────────────────────────────
  const reviewsBySlug: Record<
    string,
    {
      rating: number;
      title?: string;
      comment?: string;
      authorName: string;
      verified: boolean;
    }[]
  > = {
    "camisa-de-juego-clasica": [
      {
        rating: 5,
        title: "Impecable",
        comment: "La tela es hermosa y el corte queda perfecto. Muy recomendable.",
        authorName: "Martín G.",
        verified: true,
      },
      {
        rating: 4,
        comment: "Muy buena calidad, aunque el talle viene apenas justo.",
        authorName: "Lucía R.",
        verified: false,
      },
    ],
    "cinto-de-polo-artesanal": [
      {
        rating: 5,
        title: "Una obra de arte",
        comment: "El trenzado a mano se nota. Vale cada peso.",
        authorName: "Facundo P.",
        verified: true,
      },
    ],
  };
  let reviewCount = 0;
  for (const [slug, revs] of Object.entries(reviewsBySlug)) {
    const prod = await prisma.product.findUnique({ where: { slug } });
    if (!prod) continue;
    await prisma.review.deleteMany({ where: { productId: prod.id } });
    await prisma.review.createMany({
      data: revs.map((r) => ({
        productId: prod.id,
        rating: r.rating,
        title: r.title ?? null,
        comment: r.comment ?? null,
        authorName: r.authorName,
        email: `${r.authorName.split(" ")[0].toLowerCase()}@example.com`,
        verified: r.verified,
        approved: true,
      })),
    });
    reviewCount += revs.length;
  }
  console.log(`   ✔ ${reviewCount} reseñas`);

  console.log("✅ Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
