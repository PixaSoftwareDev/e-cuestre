// Genera imágenes placeholder locales (JPG) para el seed, así la demo no
// depende de servicios externos (picsum/unsplash) que pueden dar timeout.
// Salida: public/seed/<seed>.jpg
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "seed");

// Heroes en 16:10, productos en 4:5.
const HEROES = ["polo-hero", "noir-hero", "campo-hero"];
const PRODUCTS = [
  "cinto-1", "cinto-2", "cinto-3",
  "fusta-1", "fusta-2",
  "camisa-1", "camisa-2", "camisa-3",
  "campera-1", "campera-2", "campera-3",
  "guantes-1", "guantes-2",
  "chaleco-1", "chaleco-2", "chaleco-3",
  "botas-1", "botas-2",
];

// Paleta elegante por familia de producto (prefijo antes del "-").
const PALETTE = {
  polo: ["#3f2d20", "#8a6b4f"],
  noir: ["#111113", "#3a3a40"],
  campo: ["#2f3a2c", "#6b7a55"],
  cinto: ["#4a2f1c", "#a9764c"],
  fusta: ["#5a3d28", "#b08655"],
  camisa: ["#3a4a5a", "#7d97ad"],
  campera: ["#1a1a1e", "#43434c"],
  guantes: ["#2a2a2c", "#5c5c62"],
  chaleco: ["#2c3a3f", "#647f86"],
  botas: ["#3a2a1c", "#8a6540"],
};

const familyOf = (seed) => seed.replace(/-.*$/, "").replace(/hero$/, "").replace(/-$/, "") || seed;

function svg(seed, w, h) {
  const fam = seed.split("-")[0];
  const [c1, c2] = PALETTE[fam] ?? ["#2a2a2e", "#5a5a62"];
  const label = seed.replace(/-/g, " ").toUpperCase();
  const fontSize = Math.round(Math.min(w, h) * 0.09);
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="50%" y="50%" fill="#ffffff" fill-opacity="0.88"
    font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}"
    font-weight="600" text-anchor="middle" dominant-baseline="middle"
    letter-spacing="2">${label}</text>
</svg>`);
}

async function gen(seed, w, h) {
  const out = join(OUT_DIR, `${seed}.jpg`);
  await sharp(svg(seed, w, h)).jpeg({ quality: 82 }).toFile(out);
  console.log(`   ✔ ${seed}.jpg (${w}x${h})`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("🖼  Generando placeholders locales…");
  for (const s of HEROES) await gen(s, 1920, 1200);
  for (const s of PRODUCTS) await gen(s, 900, 1125);
  console.log("✅ Placeholders listos en public/seed/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
