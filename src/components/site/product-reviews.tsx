import { BadgeCheck } from "lucide-react";
import { getApprovedReviews, getReviewStats } from "@/lib/reviews";
import { Stars } from "@/components/site/stars";
import { ReviewForm } from "@/components/site/review-form";

export async function ProductReviews({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const [stats, reviews] = await Promise.all([
    getReviewStats(productId),
    getApprovedReviews(productId),
  ]);

  return (
    <section className="mt-16 border-t border-border pt-12 md:mt-20">
      <h2 className="font-heading text-2xl md:text-3xl">Reseñas</h2>

      <div className="mt-6 grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
        {/* Resumen + formulario */}
        <div>
          {stats.count > 0 ? (
            <>
              <div className="flex items-end gap-3">
                <span className="font-heading text-5xl tabular-nums">
                  {stats.avg.toFixed(1)}
                </span>
                <div className="pb-1">
                  <Stars rating={stats.avg} />
                  <p className="mt-1 text-xs text-muted">
                    {stats.count} reseña{stats.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = stats.dist[n] ?? 0;
                  const pct = stats.count ? (c / stats.count) * 100 : 0;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted">{n}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fg/10">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right tabular-nums text-muted">
                        {c}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              Todavía no hay reseñas. ¡Sé el primero en opinar!
            </p>
          )}

          <div className="mt-6">
            <ReviewForm productId={productId} slug={slug} />
          </div>
        </div>

        {/* Lista de reseñas */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">Sin reseñas publicadas aún.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.authorName}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {r.createdAt.toLocaleDateString("es-AR")}
                  </span>
                </div>
                <div className="mt-1">
                  <Stars rating={r.rating} size={14} />
                </div>
                {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                {r.comment && (
                  <p className="mt-1 text-sm leading-relaxed text-fg/80">
                    {r.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
