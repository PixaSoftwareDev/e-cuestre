// Genera 2 logos (PNG transparente) para las marcas demo.
import sharp from "sharp";

const COL = "#1c1a17";

// Campo & Cancha — símbolo: herradura
const campo = `
<svg width="760" height="360" viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="${COL}" stroke-width="7" stroke-linecap="round">
    <path d="M330 120 C 300 30, 460 30, 430 120" />
  </g>
  <circle cx="330" cy="118" r="6" fill="${COL}"/>
  <circle cx="430" cy="118" r="6" fill="${COL}"/>
  <circle cx="322" cy="92" r="5" fill="${COL}"/>
  <circle cx="438" cy="92" r="5" fill="${COL}"/>
  <text x="380" y="230" font-family="Georgia, 'Times New Roman', serif" font-size="58" letter-spacing="4" text-anchor="middle" fill="${COL}">CAMPO &amp; CANCHA</text>
  <text x="380" y="272" font-family="Arial, sans-serif" font-size="20" letter-spacing="10" text-anchor="middle" fill="${COL}" opacity="0.55">EQUIPAMIENTO ECUESTRE</text>
</svg>`;

// Talabartería del Sur — símbolo: rombo con costura
const tala = `
<svg width="820" height="360" viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="${COL}">
    <path d="M410 40 L458 96 L410 152 L362 96 Z" stroke-width="6" stroke-linejoin="round"/>
    <path d="M410 58 L442 96 L410 134 L378 96 Z" stroke-width="2" stroke-dasharray="4 4"/>
  </g>
  <text x="410" y="240" font-family="Georgia, 'Times New Roman', serif" font-size="54" letter-spacing="3" text-anchor="middle" fill="${COL}">TALABARTERÍA DEL SUR</text>
  <text x="410" y="282" font-family="Arial, sans-serif" font-size="20" letter-spacing="10" text-anchor="middle" fill="${COL}" opacity="0.55">CUERO ARTESANAL</text>
</svg>`;

for (const [name, svg] of [["campo-cancha", campo], ["talabarteria-sur", tala]]) {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(`C:/tmp/logo-${name}.png`);
  const m = await sharp(`C:/tmp/logo-${name}.png`).metadata();
  console.log(`logo-${name}.png ${m.width}x${m.height}`);
}
