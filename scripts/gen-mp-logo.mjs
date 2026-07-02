// Logo horizontal de Mercado Pago: fondo celeste + símbolo (handshake) blanco
// a la izquierda + "Mercado Pago" en texto blanco. Reconocible a cualquier
// tamaño. Salida: public/payments/mercadopago.png (780x500).
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const W = 780;
const H = 500;
const MP_BLUE = "#009EE3";

// Símbolo en blanco (simple-icons es monocromo).
const svg = readFileSync(join(__dirname, "mp-symbol.svg"), "utf8").replace(
  "<svg",
  '<svg fill="#ffffff"',
);
const symbol = await sharp(Buffer.from(svg))
  .resize(230, 230, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const card = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" rx="56" fill="${MP_BLUE}"/>
  <text x="300" y="222" font-family="Arial, Helvetica, sans-serif"
    font-size="96" font-weight="700" fill="#ffffff">Mercado</text>
  <text x="300" y="342" font-family="Arial, Helvetica, sans-serif"
    font-size="96" font-weight="700" fill="#ffffff">Pago</text>
</svg>`);

await sharp(card)
  .composite([{ input: symbol, left: 48, top: 135 }])
  .png()
  .toFile(join(ROOT, "public", "payments", "mercadopago.png"));

console.log("✔ public/payments/mercadopago.png (logo horizontal) generado");
