/** Skeleton mientras carga la ficha de producto. */
export default function LoadingProducto() {
  return (
    <div className="container-page py-10 md:py-16">
      <div className="mb-8 h-3 w-40 rounded skeleton" />
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Galería */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 w-16 shrink-0 rounded-brand skeleton" />
            ))}
          </div>
          <div className="aspect-[4/5] flex-1 rounded-brand skeleton" />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-9 w-3/4 rounded skeleton" />
          <div className="h-6 w-28 rounded skeleton" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded skeleton" />
            <div className="h-4 w-5/6 rounded skeleton" />
          </div>
          <div className="flex gap-2 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-14 rounded-brand skeleton" />
            ))}
          </div>
          <div className="h-12 w-full rounded-brand skeleton" />
        </div>
      </div>
    </div>
  );
}
