import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Stars } from "@/components/site/stars";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { approveReview, unapproveReview, deleteReview } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  estado?: string;
  rating?: string;
}>;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const estado =
    sp.estado === "pendientes" || sp.estado === "aprobadas"
      ? sp.estado
      : undefined;
  const ratingNum = Number(sp.rating);
  const rating =
    Number.isInteger(ratingNum) && ratingNum >= 1 && ratingNum <= 5
      ? ratingNum
      : undefined;

  const where: Prisma.ReviewWhereInput = {};
  if (estado === "pendientes") where.approved = false;
  if (estado === "aprobadas") where.approved = true;
  if (rating) where.rating = rating;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { name: true } } },
  });
  const pending = reviews.filter((r) => !r.approved).length;

  const makeHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { estado, rating: sp.rating, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, String(v));
    const qs = params.toString();
    return `/admin/resenas${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        kicker="Moderación"
        title="Reseñas"
        description={`${pending} pendiente${pending !== 1 ? "s" : ""} de aprobación · ${reviews.length} en total`}
      />

      {/* ── Filtros ─────────────────────────────────────────── */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wide text-muted">
            Estado
          </span>
          <FilterChip href={makeHref({ estado: undefined })} active={!estado}>
            Todas
          </FilterChip>
          <FilterChip
            href={makeHref({ estado: "pendientes" })}
            active={estado === "pendientes"}
          >
            Pendientes
          </FilterChip>
          <FilterChip
            href={makeHref({ estado: "aprobadas" })}
            active={estado === "aprobadas"}
          >
            Aprobadas
          </FilterChip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wide text-muted">
            Rating
          </span>
          <FilterChip href={makeHref({ rating: undefined })} active={!rating}>
            Todos
          </FilterChip>
          {[5, 4, 3, 2, 1].map((n) => (
            <FilterChip
              key={n}
              href={makeHref({ rating: String(n) })}
              active={rating === n}
            >
              {n}★
            </FilterChip>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">
            No hay reseñas con esos filtros.
          </p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Panel key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.rating} size={14} />
                    {!r.approved && <Badge variant="warning">Pendiente</Badge>}
                    {r.verified && <Badge variant="success">Compra verificada</Badge>}
                  </div>
                  <p className="mt-2 text-sm">
                    <span className="font-medium">{r.authorName}</span>{" "}
                    <span className="text-muted">· {r.product.name}</span>{" "}
                    <span className="text-muted">
                      · {r.createdAt.toLocaleDateString("es-AR")}
                    </span>
                  </p>
                  {r.title && <p className="mt-1 text-sm font-medium">{r.title}</p>}
                  {r.comment && (
                    <p className="mt-1 text-sm text-fg/80">{r.comment}</p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  {r.approved ? (
                    <form action={unapproveReview.bind(null, r.id)}>
                      <button className="rounded-brand border border-border px-3 py-1.5 text-xs transition-colors hover:border-fg/40">
                        Ocultar
                      </button>
                    </form>
                  ) : (
                    <form action={approveReview.bind(null, r.id)}>
                      <button className="rounded-brand bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg">
                        Aprobar
                      </button>
                    </form>
                  )}
                  <form action={deleteReview.bind(null, r.id)}>
                    <button className="rounded-brand border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400">
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            </Panel>
          ))}
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
