import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Play, Monitor, Smartphone, Tablet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

function fmtDuration(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

const DeviceIcon = ({ device }: { device: string | null }) => {
  if (device === "mobile") return <Smartphone className="h-4 w-4" />;
  if (device === "tablet") return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
};

const DEVICES = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
] as const;

type SearchParams = Promise<{
  device?: string;
}>;

export default async function RecordingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const device = DEVICES.some((d) => d.value === sp.device)
    ? sp.device
    : undefined;

  const where: Prisma.SessionRecordingWhereInput = {};
  if (device) where.device = device;

  const recordings = await prisma.sessionRecording.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: 100,
    include: { _count: { select: { chunks: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Grabaciones de sesión"
        description="Reviví cómo navegan los visitantes para detectar fricciones."
      />

      {/* ── Filtro por dispositivo ──────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs uppercase tracking-wide text-muted">
          Dispositivo
        </span>
        <FilterChip href="/admin/grabaciones" active={!device}>
          Todos
        </FilterChip>
        {DEVICES.map((d) => (
          <FilterChip
            key={d.value}
            href={`/admin/grabaciones?device=${d.value}`}
            active={device === d.value}
          >
            {d.label}
          </FilterChip>
        ))}
      </div>

      {recordings.length === 0 ? (
        <div className="rounded-brand border border-dashed border-border p-10 text-center text-sm text-muted">
          {device
            ? "No hay grabaciones para ese dispositivo."
            : (
              <>
                Todavía no hay grabaciones. Se generan automáticamente cuando los
                visitantes navegan la tienda (si <code>NEXT_PUBLIC_SESSION_RECORDING=true</code>).
              </>
            )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-brand border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-4 font-medium">Sesión</th>
                <th className="p-4 font-medium">Dispositivo</th>
                <th className="p-4 font-medium">Duración</th>
                <th className="p-4 font-medium">Inicio</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="p-4 font-mono text-xs">{r.sessionId.slice(0, 12)}…</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-muted">
                      <DeviceIcon device={r.device} />
                      {r.device ?? "—"}
                    </span>
                  </td>
                  <td className="p-4 tabular-nums text-muted">
                    {fmtDuration(r.duration)}
                  </td>
                  <td className="p-4 text-muted">
                    {new Intl.DateTimeFormat("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(r.startedAt)}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/grabaciones/${r.id}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Play className="h-4 w-4" /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-primary bg-primary font-medium text-primary-fg"
          : "border-border text-muted hover:border-fg/40 hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
