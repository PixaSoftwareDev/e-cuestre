// Fotos demo por color para la Camisa (para ver el cambio de fotos al elegir
// color). Salida: public/seed/camisa-<color>-<n>.jpg
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "seed");

const COLORS = [
  { key: "blanco", bg1: "#f3f2ec", bg2: "#dcdbd2", fg: "#3a3a38", label: "BLANCO" },
  { key: "azul", bg1: "#2b3a67", bg2: "#1c2748", fg: "#dfe6f5", label: "AZUL" },
];

function svg(c, n, w = 900, h = 1125) {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${c.bg1}"/><stop offset="100%" stop-color="${c.bg2}"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="50%" y="48%" fill="${c.fg}" font-family="Georgia, serif" font-size="90"
    font-weight="600" text-anchor="middle" letter-spacing="4">CAMISA</text>
  <text x="50%" y="56%" fill="${c.fg}" font-family="Georgia, serif" font-size="70"
    text-anchor="middle" letter-spacing="8">${c.label} · ${n}</text>
</svg>`);
}

console.log("🎨 Generando fotos por color…");
for (const c of COLORS) {
  for (const n of [1, 2]) {
    const out = join(OUT, `camisa-${c.key}-${n}.jpg`);
    await sharp(svg(c, n)).jpeg({ quality: 82 }).toFile(out);
    console.log(`   ✔ camisa-${c.key}-${n}.jpg`);
  }
}
console.log("✅ Listo.");
