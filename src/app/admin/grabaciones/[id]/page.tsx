import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { RecordingPlayer } from "@/components/admin/recording-player";

export default async function RecordingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recording = await prisma.sessionRecording.findUnique({
    where: { id },
    include: { chunks: { orderBy: { seq: "asc" } } },
  });
  if (!recording) notFound();

  // Concatenamos los eventos de todos los chunks en orden.
  const events = recording.chunks.flatMap((c) =>
    Array.isArray(c.events) ? (c.events as unknown[]) : [],
  );

  return (
    <div>
      <Link
        href="/admin/grabaciones"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <PageHeader
        title="Reproducción de sesión"
        description={`${recording.device ?? "—"} · ${events.length} eventos`}
      />
      <RecordingPlayer events={events} />
    </div>
  );
}
