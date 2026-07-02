// Favicons según el tema del navegador: silueta NEGRA (navegador claro) y
// BLANCA (navegador oscuro), transparentes y recortadas para ocupar el ícono.
// Además un apple-icon con fondo (para iOS). Salida en public/.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");

// Recorta el margen transparente y encuadra en un canvas cuadrado.
async function silhouette(srcFile, size, pad) {
  const trimmed = await sharp(join(PUB, srcFile)).trim().png().toBuffer();
  const inner = size - pad * 2;
  const logo = await sharp(trimmed)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  console.log("🎨 Generando favicons por tema…");

  const negro = await silhouette("logo-negro.png", 512, 20);
  await sharp(negro).toFile(join(PUB, "favicon-negro.png"));
  console.log("   ✔ favicon-negro.png (navegador claro)");

  const blanco = await silhouette("logo-blanco.png", 512, 20);
  await sharp(blanco).toFile(join(PUB, "favicon-blanco.png"));
  console.log("   ✔ favicon-blanco.png (navegador oscuro)");

  // Apple touch icon: logo blanco sobre verde de marca (visible en iOS).
  const appleLogo = await sharp(await sharp(join(PUB, "logo-blanco.png")).trim().toBuffer())
    .resize(120, 120, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 31, g: 61, b: 43, alpha: 1 } },
  })
    .composite([{ input: appleLogo, gravity: "center" }])
    .png()
    .toFile(join(PUB, "apple-icon.png"));
  console.log("   ✔ apple-icon.png");

  console.log("✅ Listo.");
}

main();
