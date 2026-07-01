import { NextRequest, NextResponse } from "next/server";
import { recordEvents, type TrackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events: TrackEvent[] = Array.isArray(body?.events) ? body.events : [];
    // Sanitizamos: solo campos esperados y máximo 50 eventos por request.
    const clean = events.slice(0, 50).filter((e) => e?.type && e?.sessionId);
    await recordEvents(clean);
    return NextResponse.json({ ok: true, count: clean.length });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
