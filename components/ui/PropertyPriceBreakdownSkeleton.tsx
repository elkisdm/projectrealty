export function PropertyPriceBreakdownSkeleton() {
  return (
    <section className="lg:hidden">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>

        {/* Precio destacado skeleton */}
        <div className="text-center space-y-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto" />
        </div>

        {/* Bloque financiero skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>

        {/* Desglose expandible skeleton */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>

        {/* CTAs skeleton */}
        <div className="pt-2 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>

        {/* Botón adicional skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
    </section>
  );
}

