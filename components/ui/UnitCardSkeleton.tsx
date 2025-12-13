export function UnitCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        group relative 
        bg-card 
        border border-border 
        rounded-2xl 
        overflow-hidden
        ${className}
      `}
    >
      {/* Image Section Skeleton */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface animate-pulse">
        <div className="w-full h-full bg-soft" />

        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-soft animate-pulse">
          <div className="w-16 h-3 bg-border rounded" />
        </div>

        {/* Favorite Button Skeleton */}
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-soft animate-pulse" />
      </div>

      {/* Content Section Skeleton */}
      <div className="p-5">
        {/* Header Skeleton */}
        <div className="mb-2">
          <div className="h-5 w-3/4 bg-soft rounded animate-pulse mb-2" />
          <div className="h-4 w-1/2 bg-soft rounded animate-pulse" />
        </div>

        {/* Separator */}
        <div className="my-3 h-px w-full bg-border" />

        {/* Price Section Skeleton */}
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <div className="h-7 w-32 bg-soft rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-soft rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
