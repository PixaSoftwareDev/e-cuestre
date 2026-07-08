import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Recibe una tanda (chunk) de eventos rrweb de una sesión y la persiste.
 * El player del admin reconstruye la sesión concatenando los chunks por `seq`.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, seq, events, device, duration } = await req.json();
    if (!sessionId || typeof seq !== "number" || !Array.isArray(events)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Asegura el registro de la sesión de forma tolerante a concurrencia: si
    // dos chunks llegan casi a la vez y ambos intentan crearlo, el segundo
    // captura el conflicto (P2002) y lo recupera, en vez de perder el chunk.
    let recording = await prisma.sessionRecording.findUnique({
      where: { sessionId },
    });
    if (!recording) {
      try {
        recording = await prisma.sessionRecording.create({
          data: {
            sessionId,
            device: device ?? null,
            duration: duration ?? 0,
            pageCount: 1,
          },
        });
      } catch {
        recording = await prisma.sessionRecording.findUnique({
          where: { sessionId },
        });
      }
    } else if (typeof duration === "number") {
      await prisma.sessionRecording.update({
        where: { sessionId },
        data: { duration },
      });
    }
    if (!recording) return NextResponse.json({ ok: false }, { status: 500 });

    await prisma.recordingChunk.upsert({
      where: { recordingId_seq: { recordingId: recording.id, seq } },
      create: { recordingId: recording.id, seq, events },
      update: { events },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recordings] error", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
