export function PropertySidebarSkeleton() {
  return (
    <aside className="hidden lg:block lg:col-span-1">
      <div className="sticky top-8">
        <div className="bg-card rounded-xl lg:rounded-2xl shadow-lg border border-border p-4 lg:p-6 space-y-4 lg:space-y-6 animate-pulse">
          {/* Título skeleton */}
          <div className="text-center space-y-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
          </div>

          {/* Precio destacado skeleton */}
          <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg lg:rounded-xl border border-blue-200 dark:border-blue-700 space-y-2">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
          </div>

          {/* Estado de disponibilidad skeleton */}
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />

          {/* Información rápida skeleton */}
          <div className="bg-surface rounded-lg lg:rounded-xl p-3 lg:p-4 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto" />
            <div className="grid grid-cols-3 gap-2 lg:gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-2 space-y-2">
                  <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del primer pago skeleton */}
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />

          {/* CTAs skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg lg:rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

