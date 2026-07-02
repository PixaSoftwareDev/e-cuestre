import { prisma } from "@/lib/prisma";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Stars } from "@/components/site/stars";
import { Badge } from "@/components/ui/badge";
import { approveReview, unapproveReview, deleteReview } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { name: true } } },
  });
  const pending = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      <PageHeader
        kicker="Moderación"
        title="Reseñas"
        description={`${pending} pendiente${pending !== 1 ? "s" : ""} de aprobación · ${reviews.length} en total`}
      />

      {reviews.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">Todavía no hay reseñas.</p>
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
