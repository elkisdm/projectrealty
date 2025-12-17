export function PropertyTabsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Tabs Navigation Skeleton */}
      <div className="flex border-b border-border overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-6 py-4"
          >
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Tab Content Skeleton */}
      <div className="min-h-[400px] space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        
        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>

        {/* Additional content skeleton */}
        <div className="space-y-3 mt-6">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

