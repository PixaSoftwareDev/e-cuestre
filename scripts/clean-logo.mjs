// Deja el logo como líneas de un color puro con canal alpha limpio (sin fondo).
// Método: fuerza el color (negro o blanco) y calcula la opacidad de cada píxel
// según su luminosidad respecto al fondo → el fondo queda 100% transparente.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = join(__dirname, "..", "public");

const lumOf = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

// mode: "dark" = línea oscura (logo negro) · "light" = línea clara (logo blanco)
async function clean(inFile, outFile, mode) {
  const { data, info } = await sharp(join(PUB, inFile))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Luminosidad del fondo (promedio de las 4 esquinas).
  const corners = [
    0,
    (width - 1) * channels,
    (height - 1) * width * channels,
    ((height - 1) * width + (width - 1)) * channels,
  ];
  // Peor caso del fondo: el más oscuro (línea oscura) o el más claro (línea
  // clara), para limpiar aunque el fondo tenga variaciones/degradé.
  const lums = corners.map((c) => lumOf(data[c], data[c + 1], data[c + 2]));
  const bgLum = mode === "dark" ? Math.min(...lums) : Math.max(...lums);

  const lineVal = mode === "dark" ? 0 : 255;
  const denom = mode === "dark" ? bgLum : 255 - bgLum;

  for (let i = 0; i < data.length; i += channels) {
    const lum = lumOf(data[i], data[i + 1], data[i + 2]);
    // Opacidad: 0 en el fondo, 1 en la línea, con borde suave.
    let a = mode === "dark" ? (bgLum - lum) / denom : (lum - bgLum) / denom;
    a = Math.max(0, Math.min(1, a));
    // Realce: recorta el "pie" tenue (ruido del fondo) para que no quede halo.
    a = a <= 0.16 ? 0 : Math.min(1, (a - 0.16) / 0.6);
    data[i] = lineVal;
    data[i + 1] = lineVal;
    data[i + 2] = lineVal;
    data[i + 3] = Math.round(a * 255);
  }

  await sharp(data, { raw: { width, height, channels } })
    .trim()
    .png()
    .toFile(join(PUB, outFile));

  console.log(`   ✔ ${outFile} — línea ${mode}, fondo lum ${bgLum | 0} → transparente`);
}

console.log("🧹 Limpiando fondos de los logos…");
await clean("logo_negro.png", "logo-negro.png", "dark");
await clean("logo_blanco.png", "logo-blanco.png", "light");
console.log("✅ Listo: solo líneas, sin fondo.");
