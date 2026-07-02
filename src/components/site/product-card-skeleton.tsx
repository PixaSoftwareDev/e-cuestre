/** Placeholder de tarjeta mientras carga el catálogo. Usa la utility .skeleton. */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] w-full rounded-brand skeleton" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/3 rounded skeleton" />
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-4 w-1/4 rounded skeleton" />
      </div>
    </div>
  );
}
