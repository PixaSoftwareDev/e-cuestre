import { NextResponse, type NextRequest } from "next/server";
import { getProducts, productFromPrice } from "@/lib/queries";
import { formatMoney } from "@/lib/money";

const GROQ_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

type ChatMsg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  if (!GROQ_KEY) {
    return NextResponse.json(
      { error: "El asistente no está configurado (falta GROQ_API_KEY)." },
      { status: 501 },
    );
  }

  let messages: ChatMsg[] = [];
  try {
    const body = await req.json();
    messages = (body.messages ?? []).slice(-10);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Catálogo como contexto (así recomienda solo productos reales).
  const products = await getProducts({});
  const catalog = products
    .map((p) => {
      const price = formatMoney(productFromPrice(p), p.currency);
      const cat = p.category?.name ?? "";
      return `- ${p.name} — ${p.brand.name}${cat ? ` · ${cat}` : ""} · ${price} · /producto/${p.slug}${p.description ? ` — ${p.description}` : ""}`;
    })
    .join("\n");

  const system = `Sos el asesor de estilo de Ecuestre, una tienda premium de polo y vida ecuestre.
Tono: cálido, elegante y breve, en español rioplatense (usá "vos"). Máximo 3-4 oraciones por respuesta.
Ayudás a elegir productos, explicás materiales y sugerís combinaciones. Recomendá SOLO productos de este catálogo y, cuando recomiendes uno, escribí su nombre EXACTO tal como figura. No inventes productos, precios ni stock.
Si preguntan algo ajeno a la tienda, redirigí con amabilidad.

CATÁLOGO ACTUAL:
${catalog}`;

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.6,
          max_tokens: 500,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "El asistente no está disponible por el momento." },
        { status: 502 },
      );
    }

    const data = await res.json();
    const reply: string =
      data.choices?.[0]?.message?.content?.trim() ??
      "Disculpá, no pude responder eso.";

    // Productos mencionados en la respuesta → tarjetas clicables.
    const lower = reply.toLowerCase();
    const suggestions = products
      .filter((p) => lower.includes(p.name.toLowerCase()))
      .slice(0, 3)
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        image: p.images[0]?.url ?? null,
        price: productFromPrice(p),
        currency: p.currency,
      }));

    return NextResponse.json({ reply, suggestions });
  } catch {
    return NextResponse.json(
      { error: "No pudimos conectar con el asistente." },
      { status: 502 },
    );
  }
}
