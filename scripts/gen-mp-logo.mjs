// Badge de Mercado Pago con el LOGO OFICIAL (scripts/mp-official.svg, de
// Wikimedia Commons) sobre fondo blanco, en formato tarjeta 780x500 para que
// combine con los demás medios de pago. Salida: public/payments/mercadopago.png
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const W = 780;
const H = 500;

// Logo oficial rasterizado con buena densidad y con algo de padding.
const logo = await sharp(join(__dirname, "mp-official.svg"), { density: 400 })
  .resize(660, 380, {
    fit: "inside",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const card = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="56" fill="#ffffff"/></svg>`,
);

await sharp(card)
  .composite([{ input: logo, gravity: "center" }])
  .png()
  .toFile(join(ROOT, "public", "payments", "mercadopago.png"));

console.log("✔ public/payments/mercadopago.png (logo oficial) generado");
