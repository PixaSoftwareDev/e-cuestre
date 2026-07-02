import { ProductCardSkeleton } from "@/components/site/product-card-skeleton";

/** Se muestra mientras Next resuelve la página del catálogo (filtros/orden). */
export default function LoadingProductos() {
  return (
    <div className="container-page py-12 md:py-16">
      <header className="mb-8">
        <div className="h-3 w-24 rounded skeleton" />
        <div className="mt-3 h-10 w-64 rounded skeleton" />
        <div className="mt-3 h-3 w-40 rounded skeleton" />
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="hidden space-y-6 lg:block">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded skeleton" />
              <div className="h-8 w-full rounded skeleton" />
              <div className="h-8 w-full rounded skeleton" />
            </div>
          ))}
        </aside>

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
