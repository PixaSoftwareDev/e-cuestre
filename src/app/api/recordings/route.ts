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

    const recording = await prisma.sessionRecording.upsert({
      where: { sessionId },
      create: {
        sessionId,
        device: device ?? null,
        duration: duration ?? 0,
        pageCount: 1,
      },
      update: {
        duration: duration ?? undefined,
      },
    });

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
