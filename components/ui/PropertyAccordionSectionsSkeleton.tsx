export function PropertyAccordionSectionsSkeleton() {
  return (
    <section className="space-y-4" aria-label="Cargando información de la propiedad">
      {/* Skeleton para 5 secciones de accordion */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm animate-pulse"
        >
          {/* Header del accordion */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Icon skeleton */}
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg w-9 h-9" />
              <div className="flex-1 space-y-2">
                {/* Title skeleton */}
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                {/* Summary skeleton */}
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
            {/* Chevron skeleton */}
            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded ml-4" />
          </div>
        </div>
      ))}
    </section>
  );
}

